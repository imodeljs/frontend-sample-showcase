/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Box, Point3d, Polyface, PolyfaceBuilder, Range3d, StrokeOptions, Transform } from "@bentley/geometry-core";
import { ColorByName, ColorDef, NpcCenter } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicBranch, GraphicType, imageElementFromUrl, IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { Particle, SampleCanvas } from "./SampleCanvas";

const url = "https://upload.wikimedia.org/wikipedia/commons/9/99/FireIcon.svg";
const color = ColorDef.fromTbgr(ColorDef.create(ColorByName.cyan).tbgr);

export class FireDecoratorPoint extends GeometryDecorator {

  constructor(public origin: Point3d) {
    super();

    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;

    const p1 = this.origin.clone();
    p1.x -= 1; p1.y -= 1; p1.z -= 1;
    const p2 = this.origin.clone();
    p2.x += 1; p2.y += 1; p2.z += 1;
    const range = Range3d.createArray([p1, p2]);

    const builder = PolyfaceBuilder.create(options);
    const box = Box.createRange(range, true);
    if (box)
      builder.addBox(box);
    else
      console.debug("as;lkfd", box);
    this.setColor(color);
    this.addGeometry(builder.claimPolyface(true));
    console.debug("Done");
  }

  public decorate(context: DecorateContext) {
    // Check view type, project extents is only applicable to show in spatial views.
    const vp = context.viewport;
    if (!vp.view.isSpatialView())
      return;
    const builder = context.createGraphicBuilder(GraphicType.WorldDecoration);
    builder.setSymbology(vp.getContrastToBackgroundColor(), ColorDef.black, 2);

    const p1 = this.origin.clone();
    p1.x -= 1; p1.y -= 1; p1.z -= 1;
    const p2 = this.origin.clone();
    p2.x += 1; p2.y += 1; p2.z += 1;
    builder.addRangeBox(Range3d.createArray([p1, p2]));
    // builder.addRangeBox(vp.iModel.projectExtents);

    context.addDecorationFromBuilder(builder);

    // Any geometry that has been added to the decorator at this point will be turned into a graphic and added as a decoration
    const branch = new GraphicBranch(false);
    branch.add(this.createGraphics(context));
    const graphic = context.createBranch(branch, Transform.identity);
    context.addDecoration(GraphicType.Scene, graphic);
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
    if (true) {

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
    } else {
      context.addHtmlDecoration(this.image);
      const builder = context.createGraphicBuilder(GraphicType.WorldDecoration);
      // builder.ad
    }
  }
}
