/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d, Range1d, Range2d, Range3d, Transform, Vector2d, Vector3d } from "@bentley/geometry-core";
import { ColorDef, Gradient, isPowerOfTwo, RenderTexture } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicBuilder, GraphicType, imageElementFromUrl, IModelApp, IModelConnection, ParticleCollectionBuilder, ParticleProps, Viewport } from "@bentley/imodeljs-frontend";
import { randomFloat, randomInteger } from "@bentley/frontend-devtools";
import { dispose } from "@bentley/bentleyjs-core";

export interface MobileParticle extends ParticleProps {
  /** Make x, y, and z from ParticleProps writable. */
  x: number;
  y: number;
  z: number;

  /** Current velocity, in pixels per second. */
  velocity: Vector3d;
}

export interface FireParams {
  /** The number of snow particles to produce. This could alternatively be expressed as a density so that small viewports would not be more crowded than larger ones. */
  numParticles: number;
  /** Range from which to randomly select each particle's size, in pixels. */
  sizeRange: Range1d;
  /** Range from which to randomly select each particle's transparency. */
  transparencyRange: Range1d;
  /** Range from which to randomly select each particle's initial velocity, in meters per second. */
  velocityRange: Range3d;
  /** Range from which to randomly select an acceleration to apply to each particle's velocity each frame, in pixels per second squared, to simulate wind. */
  accelerationRange: Range3d;
  /** Wind velocity in pixels per second in X. */
  windVelocity: number;

  windDirection: Vector3d;

  // sourceSize: Range2d;

  /** in meters */
  height: number;

  /** in meters */
  effectRange: Range2d;

  isOverlay: boolean;
}

const defaultFireParams: FireParams = {
  numParticles: 500,
  sizeRange: Range1d.createXX(0.01, 0.2),
  transparencyRange: Range1d.createXX(0, 50),
  velocityRange: new Range3d(-.01, .5, -.01, .5, -.01, .5),
  accelerationRange: new Range3d(-1, -0.25, 1, 0.25, 1, 0.25),
  windVelocity: 1,
  windDirection: Vector3d.unitX(),
  effectRange: new Range2d(-0.5, -0.5, 0.5, 0.5),
  height: 1,
  isOverlay: true, // TODO: change to false
};

const rateOfDegeneration = 0.000001;

export class FireDecorator implements Decorator {
  // TODO: share texture across instances.
  public readonly particles: MobileParticle[] = [];
  public readonly source: Point3d;
  private _texture?: RenderTexture;
  private _lastUpdateTime: number;
  private _params: FireParams;

  public static async create(viewport: Viewport, source: Point3d) {

    const image = await imageElementFromUrl("./particle-gradient-flame.png");
    // Note: the decorator takes ownership of the texture, and disposes of it when the decorator is disposed.
    const isOwned = true;
    const params = new RenderTexture.Params(undefined, undefined, isOwned);
    const texture = IModelApp.renderSystem.createTextureFromImage(image, true, undefined, params);
    // const texture = createTexture(viewport.iModel);

    if (!texture)
      return () => { };

    const particleSystem = new this(source, texture);

    // Tell the viewport to re-render the decorations every frame so that the snow particles animate smoothly.
    const removeOnRender = viewport.onRender.addListener(() => viewport.invalidateDecorations());

    // When the viewport is destroyed, dispose of this decorator too.
    const removeOnDispose = viewport.onDisposed.addListener(() => particleSystem.dispose());

    IModelApp.viewManager.addDecorator(particleSystem);

    const disposeFireDecorator = () => {
      removeOnDispose();
      removeOnRender();
      particleSystem.dispose();
    };

    const removeOnClose = viewport.iModel.onClose.addOnce(disposeFireDecorator);
    return () => {
      removeOnClose();
      disposeFireDecorator();
    };
  }

  constructor(source: Point3d, texture: RenderTexture | undefined) {
    this.source = source;
    this._params = { ...defaultFireParams };
    this._lastUpdateTime = Date.now();
    this._texture = texture;

    // Initialize the particles.
    for (let i = 0; i < this._params.numParticles; i++)
      this.particles.push(this.emit(true));
  }

  public dispose() {
    this._texture = dispose(this._texture);
  }

  /** Change some of the parameters affecting this decorator. */
  public configure(params: Partial<FireParams>): void {
    for (const key of Object.keys(params)) {
      const val = (params as any)[key];
      if (undefined !== val)
        (this._params as any)[key] = val;
    }
  }

  public decorate(context: DecorateContext): void {
    if (!this._texture)
      return;

    // Update the particles.
    const now = Date.now();
    const deltaMillis = now - this._lastUpdateTime;
    this._lastUpdateTime = now;
    this.updateParticles(deltaMillis / 1000);

    // Create particle graphics.
    const builder = ParticleCollectionBuilder.create({
      viewport: context.viewport,
      texture: this._texture,
      origin: this.source,
      size: (this._params.sizeRange.high - this._params.sizeRange.low) / 2,
    });

    for (const particle of this.particles)
      builder.addParticle(particle);

    const graphic = builder.finish();
    if (graphic) {
      const type = this._params.isOverlay ? GraphicType.WorldOverlay : GraphicType.WorldDecoration;
      context.addDecoration(type, graphic);
    }

    const range = Range3d.createXYZXYZ(
      this._params.effectRange.low.x,
      this._params.effectRange.low.y,
      0,
      this._params.effectRange.high.x,
      this._params.effectRange.high.y,
      this._params.height,
    );
    const transform = Transform.createTranslation(this.source);
    const sceneBuilder = context.createSceneGraphicBuilder();
    sceneBuilder.addRangeBox(transform.multiplyRange(range));
    context.addDecoration(GraphicType.WorldOverlay, sceneBuilder.finish());
  }

  /** Emit a new particle with randomized properties. */
  private emit(randomizeHeight: boolean): MobileParticle {
    // Select from a random point in "originRange"
    const particle = {
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
    return particle;
  }

  // Update the positions and velocities of all the particles based on the amount of time that has passed since the last update.
  private updateParticles(elapsedSeconds: number): void {
    // Determine if someone changed the desired number of particles.
    const particleDiscrepancy = this._params.numParticles - this.particles.length;
    if (particleDiscrepancy > 0) {
      // Birth new particles up to the new maximum.
      for (let i = 0; i < particleDiscrepancy; i++)
        this.particles.push(this.emit(true));
    } else {
      // Destroy extra particles.
      this.particles.length = this._params.numParticles;
    }

    const acceleration = new Vector3d();
    const velocity = new Vector3d();
    const origin = Point3d.createZero();
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

      // Apply velocity.
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
      const distance = origin.distance(particle);
      const a = rateOfDegeneration;
      const b = Math.pow((1 + a) / a, 1 / this._params.height);
      const chanceToSurvive = (a * Math.pow(b, distance)) - a;
      const reset = Math.random();
      if (reset <= chanceToSurvive)
        this.particles[i] = this.emit(false);
    }
  }
}
