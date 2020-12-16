/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

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
  wind: number;
  speed: number;
  radius: number;
  opacity: number;
  greenFactor: number;
  color: string;
  location: LocationXY;
}

export class Particle implements SampleCanvasObject {
  public readonly source: LocationXY = { x: window.innerWidth / 2, y: (window.innerHeight / 2) + 100 };
  private readonly _defaultProps = {
    wind: 0,
    speed: randomFloat(5) - 10,
    radius: 20,
    opacity: 255,
    greenFactor: 255,
    color: "rgb(255,255,0)",
    location: { x: this.source.x + randomInt(40), y: this.source.y },
  };
  public props: ParticleProps = this._defaultProps;

  constructor() {
    this.source = { x: window.innerWidth / 2, y: (window.innerHeight / 2) + 100 };
    this.reset();
  }
  public reset() {
    this.props = {
      wind: this._defaultProps.wind,
      speed: this._defaultProps.speed,
      radius: this._defaultProps.radius,
      opacity: this._defaultProps.opacity,
      greenFactor: this._defaultProps.greenFactor,
      color: this._defaultProps.color,
      location: { x: this.source.x + randomInt(40), y: this.source.y },
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
    this.props.location.x += this.props.wind;
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
