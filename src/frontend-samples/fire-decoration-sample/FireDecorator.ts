/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Point3d, PolyfaceBuilder, Range3d, Sphere, StrokeOptions, Vector3d } from "@bentley/geometry-core";
import { ColorByName, ColorDef, Gradient, GraphicParams, ImageBuffer, ImageSource, ImageSourceFormat, NpcCenter, RenderMaterial, RenderTexture, TextureMapping } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicType, imageElementFromUrl, IModelApp, Viewport } from "@bentley/imodeljs-frontend";
import { PlaceMarkerTool } from "frontend-samples/marker-pin-sample/PlaceMarkerTool";
import { Particle, ParticleObject, ParticleProps, SampleCanvas } from "./SampleCanvas";

const url = "https://upload.wikimedia.org/wikipedia/commons/9/99/FireIcon.svg";
const color = ColorDef.fromTbgr(ColorDef.create(ColorByName.cyan).tbgr);

class FireParticle extends ParticleObject {
  public move() {
    if (this.props.location.y > this.source.y + 2 || this.props.radius <= 0.001) {
      this.props = this.reset();
    }
    this.props.radius -= 15 / (300 / this.props.speed);
    this.props.opacity += 255 / (300 / this.props.speed);
    this.props.greenFactor += 255 / ((300 *  2) / this.props.speed);
    // TODO# generic-ify color's "move"
    this.props.color = `rgb(255,${(Math.floor(this.props.greenFactor) + 1)},0)`;
    // this.props.location.x += this.props.wind;
    this.props.location.x += this.props.direction.x * this.props.speed;
    this.props.location.y += this.props.direction.y * this.props.speed;
    this.props.location.z += this.props.direction.z * this.props.speed;
  }

  public reset(): ParticleProps {
    const r = this._defaultProps.radius;
    return {
      direction: Vector3d.unitZ(),
      // wind: this._defaultProps.wind,
      speed: (this.randomFloat(r / 2) - r) / 2,
      radius: this.randomFloat(this._defaultProps.radius) - 0.7,
      opacity: this._defaultProps.opacity,
      greenFactor: this._defaultProps.greenFactor,
      color: this._defaultProps.color,
      location: Point3d.create(
        this.source.x + this.randomFloat(2) - 2,
        this.source.y + this.randomFloat(2) - 2,
        this.source.z + this.randomFloat(2) - 2,
      ),
    };
  }
  protected _draw(context: DecorateContext, props: ParticleProps) {
    const vp = context.viewport;
    const gradient = Gradient.Symb.fromJSON({
      mode: Gradient.Mode.Linear,
      keys: [
        {value: 0.1, color: (ColorDef.withTransparency(ColorDef.white.toJSON(), 255))},
        {value: 1.0, color: (ColorDef.withTransparency(ColorDef.create(props.color).toJSON(), props.opacity))},
      ],
      flags: Gradient.Flags.None,
    });

    const texture = vp.target.renderSystem.getGradientTexture(gradient, vp.iModel);
    // new ImageSource()
    // vp.target.renderSystem.createTextureFromImageSource()
    if (!texture)
      return;

    const matParams = new RenderMaterial.Params();
    matParams.diffuseColor = ColorDef.white;
    matParams.shadows = false;
    matParams.ambient = 1;
    matParams.diffuse = 0;
    // matParams.alpha = 0.3;

    const mapParams = new TextureMapping.Params();
    const transform = new TextureMapping.Trans2x3(0, 1, 0, 1, 0, 0);
    mapParams.textureMatrix = transform;
    mapParams.textureMatrix.setTransform();
    matParams.textureMapping = new TextureMapping(texture, mapParams);
    const material = vp.target.renderSystem.createMaterial(matParams, vp.iModel);
    if (!material)
      return;

    const params = new GraphicParams();
    // params.lineColor = gradient.keys[0].color;
    // params.fillColor = ColorDef.white;  // Fill should be set to opaque white for gradient texture...
    // params.setFillTransparency(200);
    params.material = material;

    const options = StrokeOptions.createForCurves();
    options.needParams = true;
    options.needNormals = true;

    const poly = PolyfaceBuilder.create(options);

    const sphere = Sphere.createCenterRadius(props.location, props.radius);
    if (sphere)
      poly.addSphere(sphere);

    const builder = context.createGraphicBuilder(GraphicType.WorldOverlay);
    builder.activateGraphicParams(params);
    // builder.setSymbology(color, color, 3);
    builder.addPolyface(poly.claimPolyface(true), true);
    context.addDecorationFromBuilder(builder);
  }
}

export class FireDecoratorSource implements Decorator {
  private readonly _particles: ParticleObject[] = [];
  constructor(public source: Point3d, vp: Viewport, particleCount = 20) {
    for (let i = 0; i < particleCount; i++) {
      this._particles.push(new FireParticle(this.source, {
        direction: Vector3d.unitY(),
        speed: 1,
        radius: 0.16,
        opacity: 1,
        greenFactor: 255,
        color: "rgb(255,255,0)",
        location: this.source,
      } as ParticleProps));
    }
    setInterval(() => vp.invalidateDecorations(), 50);
  }

  private createRange3dFromOrigin(length = 2, origin = this.source): Range3d {
    const half = length / 2;
    const p1 = origin.clone();
    p1.x -= half; p1.y -= half; p1.z -= half;
    const p2 = origin.clone();
    p2.x += half; p2.y += half; p2.z += half;
    return Range3d.createArray([p1, p2]);
  }

  private createRangeBox(context: DecorateContext) {
    const vp = context.viewport;
    if (!vp.view.isSpatialView())
      return;
    const builder = context.createGraphicBuilder(GraphicType.WorldDecoration);
    builder.setSymbology(vp.getContrastToBackgroundColor(), ColorDef.black, 2);

    const box = this.createRange3dFromOrigin();
    builder.addRangeBox(box);
    // builder.addRangeBox(vp.iModel.projectExtents);

    context.addDecorationFromBuilder(builder);
  }

  public decorate(context: DecorateContext) {
    this._particles.forEach((p) => p.paint(context));

    this.createRangeBox(context);
  }
}

export class FireDecoratorPoint implements Decorator {

  public static async enable() {
    if (!IModelApp.viewManager.decorators.some((d) => d instanceof this)) {
      const image = await imageElementFromUrl(url);
      IModelApp.tools.run(PlaceMarkerTool.toolId, (point: Point3d) => {
        IModelApp.viewManager.addDecorator(new this(point, image));
      });
    }
  }

  public static disable() {
    IModelApp.viewManager.decorators
      .filter((d) => d instanceof this)
      .forEach((d) => IModelApp.viewManager.dropDecorator(d));
  }

  private createFireGeometry(context: DecorateContext) {
    const vp = context.viewport;
    let texture;
    try {
      texture = IModelApp.renderSystem.createTextureFromImage(this.image, true, vp.iModel, new RenderTexture.Params(undefined, RenderTexture.Type.Normal, true));
    } catch (error) {
      throw error;
    }

    if (!texture)
      return;

    const matParams = new RenderMaterial.Params();
    matParams.diffuseColor = ColorDef.white;
    matParams.shadows = false;
    matParams.ambient = 1;
    matParams.diffuse = 0;
    // matParams.alpha = 0.3;

    const mapParams = new TextureMapping.Params();
    const transform = new TextureMapping.Trans2x3(0, 1, 0, 1, 0, 0);
    mapParams.textureMatrix = transform;
    mapParams.textureMatrix.setTransform();
    matParams.textureMapping = new TextureMapping(texture, mapParams);
    const material = vp.target.renderSystem.createMaterial(matParams, vp.iModel);
    if (!material)
      return;

    const params = new GraphicParams();
    // params.lineColor = gradient.keys[0].color;
    // params.fillColor = ColorDef.white;  // Fill should be set to opaque white for gradient texture...
    // params.setFillTransparency(200);
    params.material = material;

    const options = StrokeOptions.createForCurves();
    options.needParams = true;
    options.needNormals = true;

    const poly = PolyfaceBuilder.create(options);

    // const range = this.createRange3dFromOrigin(0.5);
    // const box = Box.createRange(range, true);
    const sphere = Sphere.createCenterRadius(this.source, 0.2);
    if (sphere)
      poly.addSphere(sphere);

    const builder = context.createGraphicBuilder(GraphicType.WorldOverlay);
    builder.activateGraphicParams(params);
    // builder.setSymbology(color, color, 3);
    builder.addPolyface(poly.claimPolyface(true), true);
    context.addDecorationFromBuilder(builder);
  }

  private createRangeBox(context: DecorateContext) {
    const vp = context.viewport;
    if (!vp.view.isSpatialView())
      return;
    const builder = context.createGraphicBuilder(GraphicType.WorldDecoration);
    builder.setSymbology(vp.getContrastToBackgroundColor(), ColorDef.black, 2);

    const box = this.createRange3dFromOrigin();
    builder.addRangeBox(box);
    // builder.addRangeBox(vp.iModel.projectExtents);

    context.addDecorationFromBuilder(builder);
  }

  private createRange3dFromOrigin(length = 2, origin = this.source): Range3d {
    const half = length / 2;
    const p1 = origin.clone();
    p1.x -= half; p1.y -= half; p1.z -= half;
    const p2 = origin.clone();
    p2.x += half; p2.y += half; p2.z += half;
    return Range3d.createArray([p1, p2]);
  }

  constructor(public source: Point3d, public readonly image: HTMLImageElement) { }

  public decorate(context: DecorateContext) {
    this.createFireGeometry(context);
    this.createRangeBox(context);
    // Check view type, project extents is only applicable to show in spatial views.

  }
}

export class FireDecorator implements Decorator {

  private _sampleCanvas?: SampleCanvas;

  public static async enable() {
    if (!IModelApp.viewManager.decorators.some((d) => d instanceof this)) {
      const image = await imageElementFromUrl(url);
      IModelApp.viewManager.addDecorator(new this(image));
    }
  }

  public static disable() {
    IModelApp.viewManager.decorators
      .filter((d) => d instanceof this)
      .forEach((d) => IModelApp.viewManager.dropDecorator(d));
  }

  private constructor(public image: HTMLImageElement) { }

  /** Add a canvas decoration using CanvasRenderingContext2D to show a plus symbol. */
  public decorate(context: DecorateContext): void {
    if (this._sampleCanvas !== undefined)
      return;
    // const vp = context.viewport;
    // const size = Math.floor(vp.pixelsPerInch * 0.25) + 0.5;
    const position = context.viewport.npcToView(NpcCenter); position.x = Math.floor(position.x) + 0.5; position.y = Math.floor(position.y) + 0.5;
    const drawDecoration = (ctx: CanvasRenderingContext2D) => {
      this._sampleCanvas = new SampleCanvas(ctx, true);
      for (let i = 0; i < 40; i += 1)
        this._sampleCanvas.addObject(new Particle());
    };
    context.addCanvasDecoration({ position, drawDecoration });
    // context.addHtmlDecoration(this.image);
  }
}
