/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import ExplodeUI from "./ExplodeUI";
import { CoordSystem, DecorateContext, Decorator, EmphasizeElements, FeatureOverrideProvider, FeatureSymbology, GraphicBranch, GraphicType, ImdlReader, IModelApp, SceneContext, ScreenViewport, TileContent, TiledGraphicsProvider, TileRequest, TileTreeReference, Viewport } from "@bentley/imodeljs-frontend";
import { Matrix3d, Point3d, Point4d, Range3d, Transform, Vector3d } from "@bentley/geometry-core";
import { ElementGraphicsRequestProps, FeatureAppearance, IModelTileRpcInterface, Placement3d, TileVersionInfo } from "@bentley/imodeljs-common";
import { ByteStream } from "@bentley/bentleyjs-core";

interface ElementData {
  id: string;
  origin: Point3d;
  bBoxHigh: Point3d;
  bBoxLow: Point3d;
  pitch: number;
  roll: number;
  yaw: number;

  boundingBox: Range3d;
  transformWorld: Transform;
  transformExplode: Transform;
  tile: TileContent;
  isLoaded: boolean;
}

function* makeIdSequence() {
  let current = 0;
  while (true) {
    current %= Number.MAX_SAFE_INTEGER;
    yield ++current;
  }
}
const requestIdSequence = makeIdSequence();
/** Creates an unique id for requesting tiles from the backend. */
function makeRequestId(): string {
  const requestId = requestIdSequence.next();
  if (requestId.done)
    return (-1).toString(16);
  return requestId.value.toString(16);
}

/** Compute the size in meters of one pixel at the point on the tile's bounding sphere closest to the camera. */
function getPixelSizeInMetersAtClosestPoint(vp: Viewport, element: ElementData): number {

  const radius = (element.boundingBox.maxLength() ?? 0) / 2;
  const center = Point3d.createFrom(element.origin);

  const pixelSizeAtPt = computePixelSizeInMetersAtClosestPoint(vp, center, radius);
  return 0 !== pixelSizeAtPt ? vp.target.adjustPixelSizeForLOD(pixelSizeAtPt) : 1.0e-3;
}

/** Compute the size in meters of one pixel at the point on a sphere closest to the camera.
 * Device scaling is not applied.
 */
function computePixelSizeInMetersAtClosestPoint(vp: Viewport, center: Point3d, radius: number): number {
  if (vp.view.isCameraEnabled()) {
    // Find point on sphere closest to eye.
    const toEye = center.unitVectorTo(vp.view.camera.eye);
    if (toEye) {
      toEye.scaleInPlace(radius);
      center.addInPlace(toEye);
    }
  }
  const nearViewZ = vp.getFrustum(CoordSystem.View).frontCenter.z;
  const worldToViewMap = vp.viewingSpace.worldToViewMap;
  const viewPt = worldToViewMap.transform0.multiplyPoint3dQuietNormalize(center);
  if (undefined !== nearViewZ && viewPt.z > nearViewZ) {
    // Limit closest point on sphere to the near plane.
    viewPt.z = nearViewZ;
  }

  const viewPt2 = new Point3d(viewPt.x + 1.0, viewPt.y, viewPt.z);
  return worldToViewMap.transform1.multiplyPoint3dQuietNormalize(viewPt).distance(worldToViewMap.transform1.multiplyPoint3dQuietNormalize(viewPt2));
}

/** Creates a Range3d containing all the points using the Range3d API. */
function getRangeUnion(elements: ElementData[]): Range3d {
  const allPoints: Point3d[] = [];
  elements.forEach((v) => {
    allPoints.push(v.transformWorld.multiplyPoint3d(v.bBoxHigh));
    allPoints.push(v.transformWorld.multiplyPoint3d(v.bBoxLow));
  });
  return Range3d.create(...allPoints);
}

export default class ExplodeApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ExplodeUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** Uses the IModelTileRpcInterface API to query for the tile version info */
  public static async queryTileFormatVersionInfo(): Promise<TileVersionInfo> {
    return IModelTileRpcInterface.getClient().queryVersionInfo();
  }
  /** Returns a explosion provider associated with the given viewport.  If one does not exist, it will be created. */
  public static getOrCreateProvider(vp: Viewport) {
    return ExplodeProvider.getOrCreate(vp);
  }
  /** Uses the  EmphasizeElements API to isolate the elements related to the ids given. */
  public static emphasizeElements(vp: Viewport, elementIds: string[]) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.emphasizeElements(elementIds, vp, undefined, true);
  }
  /** Uses the  EmphasizeElements API to isolate the elements related to the ids given. */
  public static isolateElements(vp: Viewport, elementIds: string[]) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.isolateElements(elementIds, vp, true);
  }
  /** Uses the  EmphasizeElements API to clear all isolated and emphasized. */
  public static clearIsolateAndEmphasized(vp: Viewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearIsolatedElements(vp);
    emph.clearEmphasizedElements(vp);
  }
  /** Uses the IModel.js tools to fit the view to the object on screen. */
  public static fitView(vp: Viewport) {
    IModelApp.tools.run("View.Fit", vp, true);
  }

  /** This is the main entry point for creating the explosion effect.  This method orchestrates the data and hands it to the provider. */
  public static async explodeElements(vp: Viewport, elementIds: string[], explosionFactor: number, tileVersion: TileVersionInfo): Promise<void> {
    const provider = ExplodeApp.getOrCreateProvider(vp);
    const tileLoadedCallback = () => { provider.invalidate(); vp.synchWithView(); };
    let elements: ElementData[];
    // TODO: actually test the ids that they are all the same
    if (provider.data.map((e) => e.id).length === elementIds.length) {
      // Element information is already loaded.  No need to query it again.
      elements = provider.data;
      provider.invalidate();
    } else {
      // New object, need to query for the elements
      provider.data = [];
      elements = await ExplodeApp.queryElements(vp, elementIds);
      provider.data = elements;
    }
    ExplodeApp.populateExplosionTransform(elements, explosionFactor);
    // TODO: validate or remove
    DebuggerDecorator.setDebugDecorator(elements, vp);
    ExplodeApp.populateTileContent(vp, elements, tileVersion, tileLoadedCallback);
  }

  private static async populateTileContent(vp: Viewport, elements: ElementData[], tileVersion: TileVersionInfo, tileLoadedCallback?: (data: ElementData) => void) {
    elements.forEach((element) => {
      const pixelSize = getPixelSizeInMetersAtClosestPoint(vp, element);

      // Round down to the nearest power of ten.
      const toleranceLog10 = Math.floor(Math.log10(pixelSize));
      const formatVersion = IModelApp.tileAdmin.getMaximumMajorTileFormatVersion(tileVersion.formatVersion);

      const props: ElementGraphicsRequestProps = {
        id: makeRequestId(),
        elementId: element.id,
        toleranceLog10,
        formatVersion,
        location: element.transformExplode.toJSON(),
        // contentFlags: idProvider.contentFlags,
        // omitEdges: !this.tree.hasEdges,
        clipToProjectExtents: false,
      };
      const loadTile = async () => {
        const response: TileRequest.ResponseData | undefined = await IModelApp.tileAdmin.requestElementGraphics(vp.iModel, props);
        if (response) {
          const content = await ExplodeApp.readResponse(vp, response);
          element.tile = content;
          element.isLoaded = true;
        }
        return element;
      };
      loadTile().then(tileLoadedCallback);
    });
  }

  /** This method calculates and populates the transform for diplacing the "exploded" elements. */
  private static populateExplosionTransform(elements: ElementData[], explosionFactor: number) {
    // Find the center of the range containing all element
    // Have to do it after the world transform is populated.
    const center = getRangeUnion(elements).center;
    // Create transform for "exploding" effect
    elements.forEach((element) => {
      const vector = Vector3d.createFrom(center);
      vector.subtractInPlace(element.boundingBox.center);
      vector.scaleInPlace(explosionFactor);
      element.transformExplode = Transform.createTranslation(vector);
    });
  }

  /** Queries the backend for the elements to explode.  It also populates the data it can interpolate with a single pass. */
  private static async queryElements(vp: Viewport, elementsIds: string[]): Promise<ElementData[]> {
    const query = `Select ECInstanceID,Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh FROM BisCore:GeometricElement3d WHERE ECInstanceID IN (${elementsIds.join(",")})`;
    const results = vp.iModel.query(query);
    const data: ElementData[] = [];
    let row = await results.next();
    while (row.value) {
      const element = (row.value as ElementData);
      element.isLoaded = false;

      // Populate information from first pass
      const placement = Placement3d.fromJSON({ origin: element.origin, angles: { pitch: element.pitch, roll: element.roll, yaw: element.yaw } });
      const transform = placement.transform;
      const box = Range3d.create(element.bBoxHigh, element.bBoxLow);

      element.transformWorld = transform;
      element.boundingBox = transform.multiplyRange(box);

      data.push(element);
      row = await results.next();
    }

    return data;
  }

  /** Reads the response for tile content and returns the Tile Content. */
  private static async readResponse(vp: Viewport, response: TileRequest.ResponseData): Promise<TileContent> {
    const stream = new ByteStream((response as Uint8Array).buffer);
    const reader = ImdlReader.create(stream, vp.iModel, vp.iModel.iModelId!, vp.view.is3d(), IModelApp.renderSystem);

    let content: TileContent = { isLeaf: true };
    if (reader) {
      try {
        content = await reader.read();
      } catch (_) {
        //
      }
    }
    return content;
  }
}

/** This provider both hides the original graphics of the element and inserts the transformed graphics. */
class ExplodeProvider implements TiledGraphicsProvider, FeatureOverrideProvider {
  private static _instances = new Map<number, ExplodeProvider>();
  public data: ElementData[] = [];
  /** Returns a provider associated with a given viewport. If one does not exist, it will be created. */
  public static getOrCreate(vp: Viewport) {
    let provider = ExplodeProvider._instances.get(vp.viewportId);
    if (!provider)
      provider = ExplodeProvider.createAndAdd(vp);
    return provider;
  }
  /** Creates a provider associated with a given viewport. */
  public static createAndAdd(vp: Viewport) {
    const provider = new ExplodeProvider(vp);
    ExplodeProvider._instances.set(vp.viewportId, provider);
    provider.add(vp);
    return provider;
  }
  /** Adds provider from viewport */
  public add(vp: Viewport) {
    if (!vp.hasTiledGraphicsProvider(this)) {
      vp.addTiledGraphicsProvider(this);
      vp.addFeatureOverrideProvider(this);
    }
  }
  /** Drops provider from viewport */
  public drop() {
    this.vp.dropFeatureOverrideProvider(this);
    this.vp.dropTiledGraphicsProvider(this);
  }
  /** Singles the viewport to redraw graphics. */
  public invalidate() {
    this.vp.setFeatureOverrideProviderChanged();
  }
  private constructor(public vp: Viewport) { }

  public addFeatureOverrides(overrides: FeatureSymbology.Overrides, _vp: Viewport): void {
    const app = FeatureAppearance.fromTransparency(1);
    this.data.forEach((element) => {
      // TODO: hide elements when Emphasized (not isolated)
      overrides.overrideElement(element.id, app, true);
    });
  }

  /** Apply the supplied function to each [[TileTreeReference]] to be drawn in the specified [[Viewport]]. */
  public forEachTileTreeRef(viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    // TODO: update tile tree with new tiles
    viewport.view.forEachTileTreeRef(func);
  }

  /** Overrides the logic for adding this provider's graphics into the scene. */
  public addToScene(output: SceneContext): void {
    const vp = output.viewport;
    const branch = new GraphicBranch();
    const overrides = new FeatureSymbology.Overrides(vp);
    const app = FeatureAppearance.fromTransparency(0);
    this.data
      .filter((element) => element.isLoaded)
      .forEach((element) => {
        if (undefined === element.tile.graphic)
          return;
        overrides.overrideElement(element.id, app, true);
        // TODO: Attempt to transform without requesting new tiles.
        // Un-rotate
        // translate
        // re-rotate
        branch.add(element.tile.graphic);
      });
    branch.symbologyOverrides = overrides;
    output.outputGraphic(IModelApp.renderSystem.createGraphicBranch(branch, Transform.createIdentity(), {}));
  }
}

class DebuggerDecorator implements Decorator {
  private static instance: DebuggerDecorator;
  public static setDebugDecorator(data: ElementData[], vp: Viewport) {
    if (!this.instance) {
      this.instance = new this(data);
      IModelApp.viewManager.addDecorator(this.instance);
    } else {
      this.instance.data = data;
    }
    vp.invalidateDecorations();
  }

  private constructor(public data: ElementData[]) {
    console.debug("Debug");
  }

  public decorate(context: DecorateContext) {
    const range = getRangeUnion(this.data);
    // Mark union of areas.
    const builder = context.createGraphicBuilder(GraphicType.Scene);
    // builder.addRangeBox(range);
    // this.data.forEach((element) => {
    //   builder.addRangeBox(element.boundingBox);
    // });
    context.addDecorationFromBuilder(builder);
    // Mark center of explode point
    const pointPlacer = context.createGraphicBuilder(GraphicType.WorldOverlay);
    pointPlacer.addPointString([range.center]);
    context.addDecorationFromBuilder(pointPlacer);
  }
}
