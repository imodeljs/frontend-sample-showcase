/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Point3d, Vector3d } from "@bentley/geometry-core";
import { DecorateContext } from "@bentley/imodeljs-frontend";

/** Created following this article:
 * http://nibunan.com/articles/article/how-to-create-realistic-fire-effect-in-html5-canvas-using-javascript
 */
export abstract class SampleCanvasObject {
  public abstract paint(ctx: CanvasRenderingContext2D): void;
}

export class SampleCanvas {
  private _timer?: NodeJS.Timeout;
  private _objects: SampleCanvasObject[] = [];
  public isPainting = false;
  public get canvas(): HTMLCanvasElement { return this.ctx.canvas; }
  constructor(public readonly ctx: CanvasRenderingContext2D, initTimer = false) {
    // this.resizeCanvas();
    // window.onresize = () => {
    //   this.resizeCanvas();
    // };
    this.paintInit();
    if (initTimer)
      this.initTimer();
  }

  public resizeCanvas() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public initTimer() { this._timer = setInterval(() => { this.paint(); }, 1000 / 30); }
  public clearTimer() { this._timer = undefined; }
  public get isTimer() { return this._timer !== undefined; }

  public drawBackgroundImage() {
    // this.ctx.globalAlpha = 1;
    // this.ctx.fillStyle = "black";
    // this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.globalAlpha = 0;
  }
  public drawObjects() {
    this._objects.forEach((obj) => obj.paint(this.ctx));
  }

  public paintInit() {
    this.isPainting = true;
  }

  public paint() {
    this.paintInit();
    if (this.isPainting) {
      this.drawBackgroundImage();
      this.drawObjects();
      this.isPainting = false;
    }
  }

  public repaint() {
    this.isPainting = true;
  }
  public get countObjects(): number { return this._objects.length; }
  public addObject(obj: SampleCanvasObject) {  this._objects.push(obj); }
}

export abstract class ParticleObject {
  protected abstract _draw(context: DecorateContext, props: ParticleProps): void;
  public abstract reset(): ParticleProps;

  private _init = false;
  protected _defaultProps = {
    direction: Vector3d.unitY(),
    // wind: 0,
    speed: randomFloat(5) - 10,
    radius: 20,
    opacity: 255,
    greenFactor: 255,
    color: "rgb(255,255,0)",
    location: Point3d.create(this.source.x + randomInt(40), this.source.y),
  };
  public props: ParticleProps = this._defaultProps;

  constructor(public readonly source: Point3d, defaultProps?: ParticleProps) {
    if (defaultProps)
      this._defaultProps = defaultProps;
    this.props = this._defaultProps;
  }

  public move() {
    if (this.props.location.y < this.source.y - 20 || this.props.radius <= 1) {
      this.props = this.reset();
    }
    this.props.radius += 20 / (300 / this.props.speed);
    this.props.opacity += 255 / (300 / this.props.speed);
    this.props.greenFactor += 255 / ((300 *  2) / this.props.speed);
    // TODO# generic-ify color's "move"
    this.props.color = `rgb(255,${(Math.floor(this.props.greenFactor) + 1)},0)`;
    // this.props.location.x += this.props.wind;
    this.props.location.x += this.props.direction.x * this.props.speed;
    this.props.location.y += this.props.direction.y * this.props.speed;
    this.props.location.z += this.props.direction.z * this.props.speed;
  }

  public paint(context: DecorateContext) {
    if (!this._init) {
      this.props = this.reset();
      this._init = true;
      for (let i = 0; i < 20; i += 1) this.move();
    }
    this.move();
    this._draw(context, this.props);
  }
  protected randomFloat(range: number) {
    return ((Math.random() * range) + 1);
  }
  protected randomInt(range: number) {
    return Math.floor(this.randomFloat(range));
  }
}

function randomFloat(range: number) {
  return ((Math.random() * range) + 1);
}
function randomInt(range: number) {
  return Math.floor((Math.random() * range) + 1);
}
export interface LocationXY {
  x: number;
  y: number;
}
export interface ParticleProps {
  direction: Vector3d;
  // wind: number;
  speed: number;
  radius: number;
  opacity: number;
  greenFactor: number;
  color: string;
  location: Point3d;
}

export class Particle implements SampleCanvasObject {
  public readonly source: LocationXY = { x: window.innerWidth / 2, y: (window.innerHeight / 2) + 100 };
  private readonly _defaultProps: ParticleProps = {
    direction: Vector3d.unitY(),
    // wind: 0,
    speed: randomFloat(5) - 10,
    radius: 20,
    opacity: 255,
    greenFactor: 255,
    color: "rgb(255,255,0)",
    location: Point3d.create(this.source.x + randomInt(40), this.source.y, 0),
  };
  public props: ParticleProps = this._defaultProps;

  constructor() {
    this.source = { x: window.innerWidth / 2, y: (window.innerHeight / 2) + 100 };
    this.reset();
  }
  public reset() {
    this.props = {
      direction: Vector3d.unitY(),
      // wind: this._defaultProps.wind,
      speed: randomFloat(5) - 10,
      radius: this._defaultProps.radius,
      opacity: this._defaultProps.opacity,
      greenFactor: this._defaultProps.greenFactor,
      color: this._defaultProps.color,
      location: Point3d.create(this.source.x + randomInt(40), this.source.y),
    };
  }

  public move() {
    if (this.props.location.y < this.source.y - 300 || this.props.radius <= 1) {
      this.reset();
    }
    this.props.radius += 20 / (300 / this.props.speed);
    this.props.opacity += 255 / (300 / this.props.speed);
    this.props.greenFactor += 255 / ((300 *  2) / this.props.speed);
    this.props.color = `rgb(255,${(Math.floor(this.props.greenFactor) + 1)},0)`;
    // this.props.location.x += this.props.wind;
    this.props.location.y += this.props.speed;
  }

  public paint(ctx: CanvasRenderingContext2D) {
    const p = this.props;
    this.move();
    ctx.beginPath();
    ctx.arc(p.location.x, p.location.y, p.radius, 0, 2 * Math.PI, false);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = p.opacity / 255;
    ctx.fill();
    ctx.closePath();
  }
}
