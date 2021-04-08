/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { dispose } from "@bentley/bentleyjs-core";
import { Point2d, Range1d, Range2d, Vector2d } from "@bentley/geometry-core";
import { RenderTexture } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicType, ParticleCollectionBuilder, ParticleProps } from "@bentley/imodeljs-frontend";

/** Generate integer in [min, max]. */
function randomInteger(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** Generate random floating-point number in [min, max). */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** Represents one particle displayed by a SnowDecorator.
 * Particle positions are in CoordSystem.View.
 */
export interface SnowParticle extends ParticleProps {
  /** Make x, y, and z from ParticleProps writable. */
  x: number;
  y: number;
  z: number;

  /** Current velocity, in pixels per second. */
  velocity: Vector2d;
}

/** Parameters controlling how a SnowDecorator works. */
export interface SnowParams {
  /** The density of particles in the given view area. */
  particleDensity: number;
  /** Range from which to randomly select each particle's size, in pixels. */
  sizeRange: Range1d;
  /** Range from which to randomly select each particle's transparency. */
  transparencyRange: Range1d;
  /** Range from which to randomly select each particle's initial velocity, in pixels per second. */
  velocityRange: Range2d;
  /** Range from which to randomly select an acceleration to apply to each particle's velocity each frame, in pixels per second squared, to simulate wind. */
  accelerationRange: Range2d;
  /** Wind velocity in pixels per second in X. */
  windVelocity: number;
}

/** Simulates snowfall in a viewport using particle effects. */
export class SnowDecorator implements Decorator {
  /** The initial width and height of the viewport, from which we randomly select each particle's initial position. */
  public dimensions: Point2d;
  /** The list of particles being drawn. */
  private readonly _particles: SnowParticle[] = [];
  /** The image to display for each particle. */
  private _texture?: RenderTexture;
  /** The last time `updateParticles()` was invoked, in milliseconds. */
  private _lastUpdateTime: number;
  private readonly _params: SnowParams;
  /** Stops the particles from moving. */
  public pause: boolean = false;

  /** Calculates an integer particle count based on the params particle density. */
  public getNumParticles(): number {
    // mass (number of particles) = density * volume
    const volume = this.dimensions.x * this.dimensions.y;
    return Math.round(volume * this._params.particleDensity);
  }

  constructor(dimensions: Point2d, params: SnowParams, texture: RenderTexture | undefined) {
    this._params = this._cloneParams(params);
    this.dimensions = dimensions;
    this._lastUpdateTime = Date.now();
    this._texture = texture;

    // Initialize the particles.
    for (let i = 0; i < this.getNumParticles(); i++)
      this._particles.push(this.emit(true));
  }

  /** Replaces the textures used by the decorator. */
  public changeTexture(texture: RenderTexture | undefined) {
    this.dispose();
    this._texture = texture;
  }

  /** Invoked when this decorator is to be destroyed. */
  public dispose() {
    this._texture = dispose(this._texture);
  }

  /** Method is called to add graphics to an active view. */
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
      isViewCoords: true,
      texture: this._texture,
      size: (this._params.sizeRange.high - this._params.sizeRange.low) / 2,
    });

    for (const particle of this._particles)
      builder.addParticle(particle);

    const graphic = builder.finish();
    if (graphic)
      context.addDecoration(GraphicType.ViewOverlay, graphic);
  }

  /** Removes, and re-emits all particles. */
  public resetParticles() {
    this._particles.length = 0;
  }

  /** Returns a copy of the params.  Do not attempt to change directly.  To change, use the configure method. */
  public getParams(): SnowParams {
    return this._cloneParams(this._params);
  }

  /** Creates a deep copy of the params to prevent them being updated when this decorator is configured. */
  private _cloneParams(params: SnowParams): SnowParams {
    const clone = {};
    for (const key of Object.keys(params)) {
      const val = (params as any)[key];
      if (undefined !== val)
        (clone as any)[key] = val;
    }
    return clone as SnowParams;
  }

  /** Change some of the parameters affecting this decorator. */
  public configure(params: Partial<SnowParams>): void {
    for (const key of Object.keys(params)) {
      const val = (params as any)[key];
      if (undefined !== val)
        (this._params as any)[key] = val;
    }
  }

  /** Emit a new particle with randomized properties. */
  private emit(randomizeHeight: boolean): SnowParticle {
    return {
      x: randomInteger(0, this.dimensions.x),
      y: randomizeHeight ? randomInteger(0, this.dimensions.y) : 0,
      z: 0,
      size: randomInteger(this._params.sizeRange.low, this._params.sizeRange.high),
      transparency: randomInteger(this._params.transparencyRange.low, this._params.transparencyRange.high),
      velocity: new Vector2d(
        randomFloat(this._params.velocityRange.low.x, this._params.velocityRange.high.x),
        randomFloat(this._params.velocityRange.low.y, this._params.velocityRange.high.y)
      ),
    };
  }

  // Update the positions and velocities of all the particles based on the amount of time that has passed since the last update.
  private updateParticles(elapsedSeconds: number): void {
    const numParticles = this.getNumParticles();
    // Determine if someone changed the desired number of particles.
    const particleDiscrepancy = numParticles - this._particles.length;
    if (particleDiscrepancy > 0) {
      // Birth new particles up to the new maximum.
      for (let i = 0; i < particleDiscrepancy; i++)
        this._particles.push(this.emit(true));
    } else {
      // Destroy extra particles.
      this._particles.length = numParticles;
    }

    // If the decorator is paused, don't updated.
    if (this.pause)
      return;

    const acceleration = new Vector2d();
    const velocity = new Vector2d();
    for (let i = 0; i < this._particles.length; i++) {
      // Apply some acceleration to produce random drift.
      const particle = this._particles[i];
      acceleration.set(
        randomFloat(this._params.accelerationRange.low.x, this._params.accelerationRange.high.x),
        randomFloat(this._params.accelerationRange.low.y, this._params.accelerationRange.high.y)
      );

      acceleration.scale(elapsedSeconds, acceleration);
      particle.velocity.plus(acceleration, particle.velocity);

      // A scaling factor based on size to create an illusion of distance.
      let distanceScaling = (particle.size! as number / this._params.sizeRange.high);
      distanceScaling = Range1d.createXX(0.60, 1).fractionToPoint(distanceScaling);
      // Apply velocity.
      particle.velocity.clone(velocity);
      velocity.scale(elapsedSeconds, velocity);
      velocity.scale(distanceScaling, velocity);
      particle.x += velocity.x;
      if (velocity.y > 0) // prevent the particles from stalling
        particle.y += velocity.y;
      else // if it would stall, use previous velocity.
        particle.y += particle.velocity.y;

      // Apply wind
      particle.x += this._params.windVelocity * elapsedSeconds * distanceScaling;

      // Particles that travel beyond the viewport's left or right edges wrap around to the other side.
      if (particle.x < 0)
        particle.x = this.dimensions.x - 1;
      else if (particle.x >= this.dimensions.x)
        particle.x = 0;

      // Particles that travel beyond the viewport's bottom or top edges are replaced by newborn particles.
      if (particle.y < 0 || particle.y >= this.dimensions.y)
        this._particles[i] = this.emit(false);
    }
  }
}

