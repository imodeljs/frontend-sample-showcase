/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { dispose } from "@bentley/bentleyjs-core";
import { Point3d, Range1d, Range2d, Range3d, Vector3d } from "@bentley/geometry-core";
import { RenderTexture } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicType, imageElementFromUrl, IModelApp, ParticleCollectionBuilder, ParticleProps, Viewport } from "@bentley/imodeljs-frontend";

/** Generate integer in [min, max]. */
export function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate random floating-point number in [min, max). */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

interface MobileParticle extends ParticleProps {
  /** Make x, y, and z from ParticleProps writable. */
  x: number;
  y: number;
  z: number;

  /** Current velocity, in pixels per second. */
  velocity: Vector3d;
  /** Denotes the type of particle. */
  type: "Smoke" | "Fire";
}

export interface FireParams {
  /** This scales the number of particles from 0 at a value of 0 to 7000 at a value of 1, at an exponential rate. */
  particleNumScale: number;
  /** Range from which to randomly select each fire particle's size, in pixels. */
  sizeRange: Range1d;
  /** Range from which to randomly select each particle's transparency. */
  transparencyRange: Range1d;
  /** Range from which to randomly select each particle's initial velocity, in meters per second. */
  velocityRange: Range3d;
  /** Range from which to randomly select an acceleration to apply to each particle's velocity each frame. */
  accelerationRange: Range3d;
  /** Wind velocity. */
  windVelocity: number;
  /** Wind direction normalized. */
  windDirection: Vector3d;
  /** The height of the flames in meters. */
  height: number;
  /** The range which fire particles can be emitted. */
  effectRange: Range2d;
  /** When true, the particles will be rendered as a WorldOverlay, on top of the scene. */
  isOverlay: boolean;
  /** When enabled, the smoke will be emitted at the end of the flames (will extend pass the specified height). */
  enableSmoke: boolean;
  /** Range from which to randomly select each smoke particle's size, in pixels. */
  smokeSizeRange: Range1d;
}

/** This decorator functions as a particle emitter at the given a XYZ source and the particles are stylized as a fire burning.
 * Note: Assumes up is Z.
 */
export class FireDecorator implements Decorator {
  private static readonly _rateOfDegeneration = 0.000001;
  private static readonly _rateOfGrowth = 0.1;
  private static readonly _maximumParticles = 7000;

  public static decorators = new Set<FireDecorator>();
  private static _fireTexture?: RenderTexture;
  private static _smokeTexture?: RenderTexture;
  private static _removeOnRender?: () => void;
  private static _removeOnDispose?: () => void;
  private static _removeOnClose?: () => void;

  public readonly particles: MobileParticle[] = [];
  public readonly source: Point3d;
  private _lastUpdateTime: number;
  private _params: FireParams;

  /** If the textures are not created yet, will attempt to create them.  Returns true if successful. */
  private static async tryTextures(): Promise<boolean> {
    const isOwned = true;
    // Note: the decorator takes ownership of the texture, and disposes of it when the decorator is disposed.
    const params = new RenderTexture.Params(undefined, undefined, isOwned);
    if (!FireDecorator._fireTexture) {
      const fireImage = await imageElementFromUrl("./particle-gradient-flame.png");
      FireDecorator._fireTexture = IModelApp.renderSystem.createTextureFromImage(fireImage, true, undefined, params);
    }
    if (!FireDecorator._smokeTexture) {
      const smokeImage = await imageElementFromUrl("./particle-gradient-smoke.png");
      FireDecorator._smokeTexture = IModelApp.renderSystem.createTextureFromImage(smokeImage, true, undefined, params);
    }
    return (FireDecorator._fireTexture !== undefined && FireDecorator._smokeTexture !== undefined);
  }

  /** Only dispose of resources that are not used by any other decorators. */
  private static _tryDisposeTextures() {
    if (FireDecorator.decorators.size === 0) {
      FireDecorator._fireTexture = dispose(FireDecorator._fireTexture);
      FireDecorator._smokeTexture = dispose(FireDecorator._smokeTexture);
      // Remove listeners
      if (FireDecorator._removeOnRender !== undefined)
        FireDecorator._removeOnRender();
      FireDecorator._removeOnRender = undefined;
      if (FireDecorator._removeOnDispose !== undefined)
        FireDecorator._removeOnDispose();
      FireDecorator._removeOnDispose = undefined;
      if (FireDecorator._removeOnClose !== undefined)
        FireDecorator._removeOnClose();
      FireDecorator._removeOnClose = undefined;
    }
  }
  /** Drops all decorators and disposes of owed resources. */
  public static dispose() {
    FireDecorator.decorators.forEach((fire) => fire.dispose());
    FireDecorator._tryDisposeTextures();
  }

  /** Creates a new fire particle decorator at the given world position. */
  public static async create(viewport: Viewport, source: Point3d, params: FireParams): Promise<FireDecorator | undefined> {
    if (!await FireDecorator.tryTextures())
      return undefined;

    const fireDecorator = new this(source, params);

    if (FireDecorator.decorators.size === 0) {
      // When the iModel is closed, dispose of any decorations.
      FireDecorator._removeOnClose = viewport.iModel.onClose.addOnce(() => FireDecorator.dispose());
      // When the viewport is destroyed, dispose of any decorations. too.
      FireDecorator._removeOnDispose = viewport.onDisposed.addListener(() => FireDecorator.dispose());
      // Tell the viewport to re-render the decorations every frame so that the snow particles animate smoothly.
      FireDecorator._removeOnRender = viewport.onRender.addListener(() => viewport.invalidateDecorations());
    }

    FireDecorator.decorators.add(fireDecorator);
    IModelApp.viewManager.addDecorator(fireDecorator);

    return fireDecorator;
  }

  /** Drop decorator and attempt to dispose of resources. */
  public dispose() {
    FireDecorator.decorators.delete(this);
    IModelApp.viewManager.dropDecorator(this);
    FireDecorator._tryDisposeTextures();
  }

  private calculateNumParticle(): number {
    // y(normalized change of survival) = a * b ^ x(distance) + c(-a)
    const maximumMass = FireDecorator._maximumParticles;
    const a = FireDecorator._rateOfGrowth;
    const b = (1 + a) / a;
    const exponentialDensityScaling = (a * Math.pow(b, this._params.particleNumScale)) - a;
    const smokeMultiplier = this._params.enableSmoke ? 1.75 : 1;

    return Math.round(exponentialDensityScaling * maximumMass * smokeMultiplier);
  }

  private constructor(source: Point3d, params: FireParams) {
    this.source = source;
    this._params = { ...params };
    this._lastUpdateTime = Date.now();

    // Initialize the particles.
    for (let i = 0; i < this.calculateNumParticle(); i++)
      this.particles.push(this.emitFire(true));
  }

  /** Get the current parameters for the decorator. */
  public get params(): FireParams { return this._params; }

  /** Change some of the parameters affecting this decorator. */
  public configure(params: Partial<FireParams>): void {
    for (const key of Object.keys(params)) {
      const val = (params as any)[key];
      if (undefined !== val)
        (this._params as any)[key] = val;
    }
  }

  public decorate(context: DecorateContext): void {
    if (!FireDecorator._fireTexture || !FireDecorator._smokeTexture)
      return;

    // Update the particles.
    const now = Date.now();
    const deltaMillis = now - this._lastUpdateTime;
    this._lastUpdateTime = now;
    this.updateParticles(deltaMillis / 1000);

    // Create particle graphics.
    const smokeBuilder = ParticleCollectionBuilder.create({
      viewport: context.viewport,
      texture: FireDecorator._smokeTexture,
      origin: this.source,
      size: (this._params.sizeRange.high - this._params.sizeRange.low) / 2,
    });

    // Create particle graphics.
    const fireBuilder = ParticleCollectionBuilder.create({
      viewport: context.viewport,
      texture: FireDecorator._fireTexture,
      origin: this.source,
      size: (this._params.sizeRange.high - this._params.sizeRange.low) / 2,
    });

    // Process Particles
    for (const particle of this.particles)
      if (particle.type === "Smoke")
        smokeBuilder.addParticle(particle);
      else
        fireBuilder.addParticle(particle);

    // Add graphics to context.
    let graphic = fireBuilder.finish();
    const type = this._params.isOverlay ? GraphicType.WorldOverlay : GraphicType.WorldDecoration;
    if (graphic)
      context.addDecoration(type, graphic);
    graphic = smokeBuilder.finish();
    if (graphic)
      context.addDecoration(type, graphic);
  }

  /** Emit a new fire particle with randomized properties. */
  private emitFire(randomizeHeight: boolean): MobileParticle {
    return {
      type: "Fire",
      x: randomFloat(this._params.effectRange.low.x, this._params.effectRange.high.x),
      y: randomFloat(this._params.effectRange.low.y, this._params.effectRange.high.y),
      z: randomizeHeight ? randomFloat(0, this._params.height) : 0,
      size: randomFloat(this._params.sizeRange.low, this._params.sizeRange.high),
      transparency: randomInteger(this._params.transparencyRange.low, this._params.transparencyRange.high),
      velocity: new Vector3d(
        randomFloat(this._params.velocityRange.low.x, this._params.velocityRange.high.x),
        randomFloat(this._params.velocityRange.low.y, this._params.velocityRange.high.y),
        randomFloat(this._params.velocityRange.low.z, this._params.velocityRange.high.z),
      ),
    };
  }

  /** Emit a new smoke particle base on the fire particle it came from with randomized size. */
  private emitSmoke(parent: MobileParticle): MobileParticle {
    return {
      type: "Smoke",
      x: parent.x,
      y: parent.y,
      z: parent.z,
      size: randomFloat(this._params.smokeSizeRange.low, this._params.smokeSizeRange.high),
      transparency: parent.transparency,
      velocity: parent.velocity,
    };
  }

  /** Update the positions and velocities of all the particles based on the amount of time that has passed since the last update. */
  private updateParticles(elapsedSeconds: number): void {
    // Determine if someone changed the desired number of particles.
    const numParticles = this.calculateNumParticle();
    const particleDiscrepancy = numParticles - this.particles.length;
    if (particleDiscrepancy > 0) {
      // Birth new particles up to the new maximum.
      for (let i = 0; i < particleDiscrepancy; i++)
        this.particles.push(this.emitFire(true));
    } else {
      // Destroy extra particles.
      this.particles.length = numParticles;
    }

    const acceleration = new Vector3d();
    const velocity = new Vector3d();
    for (let i = 0; i < this.particles.length; i++) {
      // Apply some acceleration to produce random drift.
      const particle = this.particles[i];
      acceleration.set(
        randomFloat(this._params.accelerationRange.low.x, this._params.accelerationRange.high.x),
        randomFloat(this._params.accelerationRange.low.y, this._params.accelerationRange.high.y),
        randomFloat(this._params.accelerationRange.low.z, this._params.accelerationRange.high.z),
      );

      acceleration.scale(elapsedSeconds, acceleration);
      particle.velocity.plus(acceleration, particle.velocity);

      // Apply velocity
      particle.velocity.clone(velocity);
      velocity.scale(elapsedSeconds, velocity);
      particle.x += velocity.x;
      particle.y += velocity.y;
      particle.z += velocity.z;

      // Apply wind
      particle.x += this._params.windVelocity * elapsedSeconds * this._params.windDirection.x;
      particle.y += this._params.windVelocity * elapsedSeconds * this._params.windDirection.y;
      particle.z += this._params.windVelocity * elapsedSeconds * this._params.windDirection.z;

      // Particles that travel beyond the height, they are replace with a new particle.
      const origin = Point3d.createZero();
      let distance = (origin.distance(particle) * 0.75) + (particle.z * 0.25);
      if (particle.type === "Smoke" && particle.transparency) {
        distance /= 2;
        const linear = Math.round(((distance / this._params.height) * 255));
        particle.transparency = Math.max(particle.transparency, linear);
      }
      // Re-emits particles that have expired.  The chance of survival is exponentially inverse to their distance from the source.
      // y(normalized change of survival) = a * b ^ x(distance) + c(-a)
      const a = FireDecorator._rateOfDegeneration;
      const b = Math.pow((1 + a) / a, 1 / this._params.height);
      const chanceToSurvive = (a * Math.pow(b, distance)) - a;
      const reset = Math.random();
      if (reset <= chanceToSurvive) {
        if (this._params.enableSmoke && particle.type !== "Smoke")
          this.particles[i] = this.emitSmoke(particle);
        else
          this.particles[i] = this.emitFire(false);
      }
    }
  }
}
