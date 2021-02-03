/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import ExplodeUI from "./ExplodeUI";
import { Animator, CoordSystem, DecorateContext, Decorator, EmphasizeElements, FeatureOverrideProvider, FeatureSymbology, GraphicBranch, GraphicType, ImdlReader, IModelApp, SceneContext, ScreenViewport, Tile, TileContent, TiledGraphicsProvider, TileRequest, TileTreeReference, Viewport } from "@bentley/imodeljs-frontend";
import { Matrix3d, Point3d, Point4d, Range3d, Transform, Vector3d, XYZ, XYZProps } from "@bentley/geometry-core";
import { ElementGraphicsRequestProps, FeatureAppearance, IModelTileRpcInterface, Placement3d, TileVersionInfo } from "@bentley/imodeljs-common";
import { ByteStream, compareStrings, SortedArray } from "@bentley/bentleyjs-core";
import { ExplodeTreeReference } from "./ExplodeTile";

interface ElementData {
  id: string;
  origin: Point3d;
  pitch: number;
  roll: number;
  yaw: number;

  boundingBox: Range3d;
  transformWorld: Transform;
  transformExplode?: Transform;
  tile?: TileContent; // TODO: Remove
}

interface ElementDataProps {
  id: string;
  origin: XYZProps;
  bBoxHigh: XYZProps;
  bBoxLow: XYZProps;
  pitch: number;
  roll: number;
  yaw: number;
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
  const range = Range3d.createNull();
  for (const elem of elements)
    range.extendRange(elem.boundingBox);
  return range;
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
  public static refSetData(vp: Viewport, name: string, ids: string[], explodeFactor: number) {
    const provider = ExplodeApp.getOrCreateProvider(vp);
    provider.setData(name, ids, explodeFactor);
    provider.invalidate();
  }

  /** This is the main entry point for creating the explosion effect.  This method orchestrates the data and hands it to the provider. */
  public static async explodeElements(vp: Viewport, elementIds: string[], explodeFactor: number, tileVersion: TileVersionInfo): Promise<void> {
    const provider = ExplodeApp.getOrCreateProvider(vp);
    const newIds: string[] = [];
    const oldData = provider.data;
    let data: ElementData[] = [];
    for (const id of elementIds) {
      let element: ElementData | undefined;
      if (element = oldData.get(id))
        // Tiles are already loaded.  Still need to update the explode transform.
        data.push(element);
      else
        // No tiles loaded.  Need to request new ones from the backend before creating a new transform.
        newIds.push(id);
    }
    if (newIds.length > 0) {
      const props = await this.queryElements(vp, newIds);
      const newData: ElementData[] = ExplodeApp.createElementData(props);

      ExplodeApp.populateExplosionTransform(newData, explodeFactor);
      for (const element of newData)
        ExplodeApp.populateTileContent(vp, element, tileVersion).then(() => {
          provider.data.set(element.id, element);
          provider.invalidate();
        });

      data = data.concat(newData);
    }
    // TODO: validate or remove
    DebuggerDecorator.setDebugDecorator(data, vp);
    ExplodeApp.populateExplosionTransform(data, explodeFactor);
    provider.invalidate();
  }

  private static createElementData(props: ElementDataProps[]): ElementData[] {
    return props.map((element) => {
      // Populate information from first pass
      const placement = Placement3d.fromJSON({ origin: element.origin, angles: { pitch: element.pitch, roll: element.roll, yaw: element.yaw } });
      const transform = placement.transform;
      const box = Range3d.create(Point3d.fromJSON(element.bBoxLow), Point3d.fromJSON(element.bBoxHigh));

      const boundingBox = transform.multiplyRange(box);
      return { ...element, transformWorld: transform, boundingBox, origin: Point3d.fromJSON(element.origin) } as ElementData;
    });
  }

  private static async populateTileContent(vp: Viewport, element: ElementData, tileVersion: TileVersionInfo) {
    const pixelSize = getPixelSizeInMetersAtClosestPoint(vp, element);

    // Round down to the nearest power of ten.
    const toleranceLog10 = Math.floor(Math.log10(pixelSize));
    const formatVersion = IModelApp.tileAdmin.getMaximumMajorTileFormatVersion(tileVersion.formatVersion);

    const props: ElementGraphicsRequestProps = {
      id: makeRequestId(),
      elementId: element.id,
      toleranceLog10,
      formatVersion,
      // location: element.transformExplode.toJSON(),
      // contentFlags: idProvider.contentFlags,
      // omitEdges: !this.tree.hasEdges,
      clipToProjectExtents: false,
    };
    const response: TileRequest.ResponseData | undefined = await IModelApp.tileAdmin.requestElementGraphics(vp.iModel, props);
    if (response) {
      const content = await ExplodeApp.readResponse(vp, response);
      element.tile = content;
    }
  }

  /** This method calculates and populates the transform for displacing the "exploded" elements. */
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
  private static async queryElements(vp: Viewport, elementsIds: string[]): Promise<ElementDataProps[]> {
    const query = `Select ECInstanceID,Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh FROM BisCore:GeometricElement3d WHERE ECInstanceID IN (${elementsIds.join(",")})`;
    const results = vp.iModel.query(query);
    const data: ElementDataProps[] = [];
    let row = await results.next();
    while (row.value) {
      const element = (row.value as ElementDataProps);

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
  public data = new Map<string, ElementData>();
  /** Returns a provider associated with a given viewport. If one does not exist, it will be created. */
  public static getOrCreate(vp: Viewport) {
    let provider = vp.findFeatureOverrideProviderOfType(ExplodeProvider);
    if (!provider)
      provider = ExplodeProvider.createAndAdd(vp);
    return provider;
  }
  /** Creates a provider associated with a given viewport. */
  public static createAndAdd(vp: Viewport) {
    const provider = new ExplodeProvider(vp);
    provider.add(vp);
    return provider;
  }
  public setData(name: string, elementIds: string[], explodeFactor: number) {
    this.explodeTileTreeRef.explodeFactor = explodeFactor;
    this.explodeTileTreeRef.setExplodeObject(name, elementIds);
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
  /** Signals the viewport to redraw graphics. */
  public invalidate() {
    this.vp.setFeatureOverrideProviderChanged();
  }
  public constructor(public vp: Viewport) { }
  public explodeTileTreeRef = new ExplodeTreeReference(this.vp.iModel);

  public addFeatureOverrides(overrides: FeatureSymbology.Overrides, _vp: Viewport): void {
    const app = FeatureAppearance.fromTransparency(1);
    this.explodeTileTreeRef.id.ids.forEach((id) => {
      // TODO: hide elements when Emphasized (not isolated)
      overrides.overrideElement(id, app, true);
    });
    this.data.forEach((element) => {
      // TODO: hide elements when Emphasized (not isolated)
      overrides.overrideElement(element.id, app, true);
    });
  }

  /** Apply the supplied function to each [[TileTreeReference]] to be drawn in the specified [[Viewport]]. */
  public forEachTileTreeRef(_viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    func(this.explodeTileTreeRef);
    // TODO: only the explode TTRef
    // viewport.view.forEachModelTreeRef(func);
  }

  /** Overrides the logic for adding this provider's graphics into the scene. */
  // public addToScene(output: SceneContext): void {
  //   const vp = output.viewport;

  //   for (const element of this.data.values()) {
  //     if (!element.tile || !element.tile.graphic || !element.transformExplode)
  //       return;
  //     const branch = new GraphicBranch();
  //     const overrides = new FeatureSymbology.Overrides(vp);
  //     const app = FeatureAppearance.fromTransparency(0);
  //     overrides.overrideElement(element.id, app, true);
  //     branch.add(element.tile.graphic);
  //     branch.symbologyOverrides = overrides;
  //     output.outputGraphic(IModelApp.renderSystem.createGraphicBranch(branch, element.transformExplode.inverse()!, {}));
  //   }
  // }
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
    builder.addRangeBox(range);
    this.data.forEach((element) => {
      builder.addRangeBox(element.boundingBox);
    });
    context.addDecorationFromBuilder(builder);
    // Mark center of explode point
    const pointPlacer = context.createGraphicBuilder(GraphicType.WorldOverlay);
    pointPlacer.addPointString([range.center]);
    context.addDecorationFromBuilder(pointPlacer);
  }
}
