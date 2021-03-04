/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d, Range1d, Range2d, Range3d, Transform, Vector3d, XYAndZ } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ColorDef, Placement3d } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicType, IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import { FireDecorator, FireParams } from "./Particle";
import { PlacementTool } from "./PlacementTool";

/** This decorator functions to highlight a given emitter by outlining the source range. */
class EmitterHighlighter implements Decorator {
  public emitter?: FireDecorator;
  public decorate(context: DecorateContext) {
    if (undefined === this.emitter)
      return;
    const minium = this.emitter.params.smokeSizeRange.low;
    const range = Range3d.createXYZXYZ(
      Math.min(this.emitter.params.effectRange.low.x, -minium),
      Math.min(this.emitter.params.effectRange.low.y, -minium),
      0,
      Math.max(this.emitter.params.effectRange.high.x, minium),
      Math.max(this.emitter.params.effectRange.high.y, minium),
      this.emitter.params.height,
    );
    console.debug(range);
    const transform = Transform.createTranslation(this.emitter.source);
    const builder = context.createSceneGraphicBuilder();
    builder.setSymbology(context.viewport.getContrastToBackgroundColor(), ColorDef.black, 3);
    builder.addRangeBox(transform.multiplyRange(range));
    context.addDecoration(GraphicType.WorldOverlay, builder.finish());
  }

  public enable(isOn: boolean) {
    if (isOn)
      IModelApp.viewManager.addDecorator(this);
    else
      IModelApp.viewManager.dropDecorator(this);
  }
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class FireDecorationApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;
  public static highlighter = new EmitterHighlighter();
  public static readonly predefinedParams = new Map<string, FireParams>(
    [
      [
        "Candle",
        {
          particleNumScale: 0.02,
          sizeRange: Range1d.createXX(0.01, 0.2),
          transparencyRange: Range1d.createXX(0, 50),
          velocityRange: Range3d.createXYZXYZ(-0.1, -0.1, -.02, 0.1, 0.1, 1),
          accelerationRange: Range3d.createXYZXYZ(-0.25, -0.25, -0.25, 0.25, 0.25, 1),
          windVelocity: 0,
          windDirection: Vector3d.createZero(),
          effectRange: Range2d.createXYXY(0, 0, 0, 0),
          height: 0.2,
          isOverlay: false,
          enableSmoke: false,
          smokeSizeRange: Range1d.createXX(0.1, 0.25),
        },
      ],
      [
        "Peaceful Camp Fire",
        {
          particleNumScale: 0.2,
          sizeRange: Range1d.createXX(0.01, 0.2),
          transparencyRange: Range1d.createXX(0, 50),
          velocityRange: Range3d.createXYZXYZ(-0.1, -0.1, -.02, 0.1, 0.1, 1),
          accelerationRange: Range3d.createXYZXYZ(-0.25, -0.25, -0.25, 0.25, 0.25, 1),
          windVelocity: 0.25,
          windDirection: Vector3d.create(0.5, 0.5, 0),
          effectRange: Range2d.createXYXY(-0.5, -0.5, 0.5, 0.5),
          height: 1,
          isOverlay: false,
          enableSmoke: true,
          smokeSizeRange: Range1d.createXX(0.1, 0.25),
        },
      ],
      [
        "Windblown Camp Fire",
        {
          particleNumScale: 0.26,
          sizeRange: Range1d.createXX(0.01, 0.2),
          transparencyRange: Range1d.createXX(0, 50),
          velocityRange: Range3d.createXYZXYZ(-0.1, -0.1, -.02, 0.1, 0.1, 1),
          accelerationRange: Range3d.createXYZXYZ(-0.25, -0.25, -0.25, 0.25, 0.25, 1),
          windVelocity: 1.8,
          windDirection: Vector3d.create(0.5, 0.5, 0),
          effectRange: Range2d.createXYXY(-0.5, -0.5, 0.5, 0.5),
          height: 1,
          isOverlay: false,
          enableSmoke: true,
          smokeSizeRange: Range1d.createXX(0.1, 0.25),
        },
      ],
      [
        "Inferno",
        {
          particleNumScale: 0.99,
          sizeRange: Range1d.createXX(0.01, 0.2),
          transparencyRange: Range1d.createXX(0, 50),
          velocityRange: Range3d.createXYZXYZ(-0.1, -0.1, -.02, 0.1, 0.1, 1),
          accelerationRange: Range3d.createXYZXYZ(-0.25, -0.25, -0.25, 0.25, 0.25, 1),
          windVelocity: 0.25,
          windDirection: Vector3d.unitY(),
          effectRange: Range2d.createXYXY(-3, -3, 3, 3),
          height: 2,
          isOverlay: false,
          enableSmoke: true,
          smokeSizeRange: Range1d.createXX(0.1, 0.25),
        },
      ],
    ],
  );

  /** Registers tools used by sample. */
  public static initTools() {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("fire-i18n-namespace");
    PlacementTool.register(this._sampleNamespace);
  }

  /** Using a decorator, sets a box around the specified emitter.  Hand undefined as an argument to clear highlighting. */
  public static highlightEmitter(emitter?: FireDecorator) {
    FireDecorationApp.highlighter.emitter = emitter;
  }

  public static zoomToVolume(viewport: ScreenViewport, volume: Range3d) {
    viewport.zoomToVolume(volume);
  }

  /** Runs the Placement Tool with highlighting disenabled using the tool registry API. */
  public static startPlacementTool(confirmedPointCallBack: (point: Point3d) => void) {
    IModelApp.tools.run(PlacementTool.toolId, confirmedPointCallBack);
  }

  /** Iterates though all decorators and returns the closest FireDecorator within a half meter. */
  public static getClosestEmitter(point: Point3d): FireDecorator | undefined {
    let closestEmitter: FireDecorator | undefined;
    let min = Number.MAX_SAFE_INTEGER;
    IModelApp.viewManager.decorators.forEach((decorator) => {
      if (decorator instanceof FireDecorator) {
        if (closestEmitter === undefined)
          closestEmitter = decorator;
        const distance = decorator.source.distance(point);
        if (distance < min) {
          min = distance;
          closestEmitter = decorator;
        }
      }
    });
    const targetRadius = closestEmitter ? (closestEmitter.params.effectRange.xLength() / 2) + 0.5 : 0;
    return min < targetRadius ? closestEmitter : undefined;
  }

  /** Queries the backend for the elements to explode.  It also populates the data it can interpolate with a single pass. */
  public static async queryElements(iModel: IModelConnection, elementsIds: string[]): Promise<Array<{ elementId: string, origin: Point3d, bBox: Range3d }>> {
    const query = `Select ECInstanceID,Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh FROM BisCore:GeometricElement3d WHERE ECInstanceID IN (${elementsIds.join(",")})`;
    const data: Array<{ elementId: string, origin: Point3d, bBox: Range3d }> = [];

    for await (const row of iModel.query(query)) {
      const element = (row as { id: string, origin: XYAndZ, pitch: number, roll: number, yaw: number, bBoxLow: XYAndZ, bBoxHigh: XYAndZ });

      const bBoxModelSpace = Range3d.create(Point3d.fromJSON(element.bBoxLow), Point3d.fromJSON(element.bBoxHigh));
      const placement = Placement3d.fromJSON({ origin: element.origin, angles: { pitch: element.pitch, roll: element.roll, yaw: element.yaw } });
      const transform = placement.transform;
      const bBox = transform.multiplyRange(bBoxModelSpace);
      const elementId = element.id;
      const origin = Point3d.fromJSON(element.origin);

      data.push({ elementId, origin, bBox });
    }

    return data;
  }
}
