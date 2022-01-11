/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Id64String } from "@itwin/core-bentley";
import { Point3d, Range1d, Range2d, Range3d, Vector3d, XYAndZ } from "@itwin/core-geometry";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { Placement3d, QueryRowFormat, RenderTexture } from "@itwin/core-common";
import { Decorator, imageElementFromUrl, IModelApp, IModelConnection, ScreenViewport, Viewport } from "@itwin/core-frontend";
import "common/samples-common.scss";
import { EmitterHighlighter, FireEmitter, FireParams } from "./FireDecorator";
import { PlacementTool } from "./PlacementTool";

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class FireDecorationApi {
  private static _highlighter?: EmitterHighlighter;
  private static _dropListeners: VoidFunction[] = [];

  /** Registers tools used by sample. */
  public static initTools() {
    void IModelApp.localization.registerNamespace("fire-i18n-namespace");
    PlacementTool.register("fire-i18n-namespace");
  }

  /** Using a decorator, sets a box around the specified emitter.  Pass undefined as an argument to clear highlighting. */
  public static highlightEmitter(emitter?: FireEmitter) {
    // To ensure the highlight box is on top of any emitter particles at that are created as a WorldOverlay, we ensure this decorator is always the last in the decorator list.
    if (FireDecorationApi._highlighter) {
      IModelApp.viewManager.dropDecorator(FireDecorationApi._highlighter);
      FireDecorationApi._highlighter = undefined;
    }
    if (emitter) {
      FireDecorationApi._highlighter = new EmitterHighlighter(emitter);
      IModelApp.viewManager.addDecorator(FireDecorationApi._highlighter);
    }
  }

  /** Zooms the view to a specific volume in the model using the viewport API. */
  public static zoomToVolume(viewport: ScreenViewport, volume: Range3d) {
    viewport.zoomToVolume(volume);
  }

  /** Manages a new listener for the view open event using the ViewManager API. */
  public static onViewOpen(type: "Once" | "listener", listener: (viewport: ScreenViewport) => void, scope?: any) {
    const event = IModelApp.viewManager.onViewOpen;
    let dispose: () => void;
    if (type === "Once")
      dispose = event.addOnce(listener, scope);
    else
      dispose = event.addListener(listener, scope);
    // Calling dispose method drops the listener from the event.
    FireDecorationApi._dropListeners.push(dispose);
  }

  /** Runs the Placement Tool which will run the callback function passing the point the user confirms. */
  public static startPlacementTool(confirmedPointCallBack: (point: Point3d, viewport: Viewport) => void) {
    void IModelApp.tools.run(PlacementTool.toolId, confirmedPointCallBack);
  }

  /** Returns the next available transient id using the IModelConnection API. */
  public static getNextTransientId(iModel: IModelConnection): Id64String {
    return iModel.transientIds.next;
  }

  /** Uses the ViewManager API to add a decorator that will be rendered. */
  public static addDecorator(decorator: Decorator) {
    IModelApp.viewManager.addDecorator(decorator);
  }

  /** Uses the ViewManager API to drop a decorator that was being rendered. */
  public static dropDecorator(decorator: Decorator) {
    IModelApp.viewManager.dropDecorator(decorator);
  }

  /** Disposes of each emitter, triggering disposal of their owned resources. */
  public static disposeAllEmitters() {
    // The FireEmitters collectively own the textures and will dispose of them when no longer required.
    FireDecorationApi.getAllEmitters().forEach((fire) => {
      FireDecorationApi.dropDecorator(fire);
      fire.dispose();
    });
  }

  /** Allocates memory and creates a RenderTexture from a given URL. */
  public static async allocateTextureFromUrl(url: string): Promise<RenderTexture | undefined> {
    // Note: the caller takes ownership of the textures, and disposes of those resources when they are no longer needed.
    const isOwned = true;
    const params = new RenderTexture.Params(undefined, undefined, isOwned);
    const fireImage = await imageElementFromUrl(url);
    return IModelApp.renderSystem.createTextureFromImage(fireImage, true, undefined, params);
  }

  /** Attempts to create a new fire emitter. */
  public static async createFireDecorator(source: Point3d, params: FireParams, viewport?: Viewport): Promise<FireEmitter | undefined> {
    const vp = viewport ?? IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return undefined;

    if (FireDecorationApi.getAllEmitters().length === 0)
      // Tell the viewport to re-render the decorations every frame so that the fire particles animate smoothly.
      FireDecorationApi._dropListeners.push(vp.onRender.addListener(() => vp.invalidateDecorations()));

    // The FireEmitter class itself handles ensuring the timely allocation of textures.
    const fireDecorator = await FireEmitter.create(vp, source, params);
    if (fireDecorator)
      FireDecorationApi.addDecorator(fireDecorator);
    return fireDecorator;
  }

  /** Returns a list of FireEmitter decorators that have been added using the ViewManager API. */
  public static getAllEmitters(): FireEmitter[] {
    return IModelApp.viewManager.decorators.filter((decorator) => decorator instanceof FireEmitter) as FireEmitter[];
  }

  /** Removes listeners up and frees any resources owned by this sample. */
  public static dispose() {
    FireDecorationApi._dropListeners.forEach((func) => func());
    FireDecorationApi._dropListeners = [];
    FireDecorationApi.disposeAllEmitters();
  }

  /** Queries the backend for the elements that will act as targets for the demo on the Villa iModel. */
  public static async queryElements(iModel: IModelConnection, elementsIds: string[]): Promise<Array<{ origin: Point3d, bBox: Range3d }>> {
    const query = `Select Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh FROM BisCore:GeometricElement3d WHERE ECInstanceID IN (${elementsIds.join(",")})`;
    const data: Array<{ origin: Point3d, bBox: Range3d }> = [];

    for await (const row of iModel.query(query, undefined, { rowFormat: QueryRowFormat.UseJsPropertyNames })) {
      const element = (row as { origin: XYAndZ, pitch: number, roll: number, yaw: number, bBoxLow: XYAndZ, bBoxHigh: XYAndZ });

      const bBoxModelSpace = Range3d.create(Point3d.fromJSON(element.bBoxLow), Point3d.fromJSON(element.bBoxHigh));
      const placement = Placement3d.fromJSON({ origin: element.origin, angles: { pitch: element.pitch, roll: element.roll, yaw: element.yaw } });
      const transform = placement.transform;
      // Transform bounding box to the world location of the element. (Will be used when zooming to the Villa Demo)
      const bBox = transform.multiplyRange(bBoxModelSpace);
      const origin = Point3d.fromJSON(element.origin);

      data.push({ origin, bBox });
    }

    return data;
  }

  /** Predefined parameters that will act as a base when creating a FireEmitter Decorator. */
  public static predefinedParams = new Map<string, FireParams>(
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
        "Peaceful Campfire",
        {
          particleNumScale: 0.3,
          sizeRange: Range1d.createXX(0.05, 0.4),
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
        "Windblown Campfire",
        {
          particleNumScale: 0.29,
          sizeRange: Range1d.createXX(0.05, 0.4),
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
          sizeRange: Range1d.createXX(0.1, 0.8),
          transparencyRange: Range1d.createXX(0, 50),
          velocityRange: Range3d.createXYZXYZ(-0.1, -0.1, -.02, 0.1, 0.1, 1),
          accelerationRange: Range3d.createXYZXYZ(-0.25, -0.25, -0.25, 0.25, 0.25, 1),
          windVelocity: 0.25,
          windDirection: Vector3d.unitY(),
          effectRange: Range2d.createXYXY(-3, -3, 3, 3),
          height: 3.5,
          isOverlay: false,
          enableSmoke: true,
          smokeSizeRange: Range1d.createXX(0.1, 0.25),
        },
      ],
    ],
  );
}
