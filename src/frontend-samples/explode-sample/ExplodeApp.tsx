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
import { ElementGraphicsRequestProps, FeatureAppearance, TileVersionInfo } from "@bentley/imodeljs-common";
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

export default class ExplodeApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ExplodeUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static getRangeUnion(elements: ElementData[]): Range3d {
    const allPoints: Point3d[] = [];
    elements.forEach((v) => {
      allPoints.push(v.transformWorld.multiplyPoint3d(v.bBoxHigh));
      allPoints.push(v.transformWorld.multiplyPoint3d(v.bBoxLow));
    });
    return Range3d.create(...allPoints);
  }

  public static getOrCreateProvider(vp: Viewport) {
    return ExplodeProvider.getOrCreate(vp);
  }

  public static isolateElements(vp: Viewport, elementIds: string[]) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.isolateElements(elementIds, vp, true);
  }
  public static clearIsolate(vp: Viewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearIsolatedElements(vp);
  }
  public static fitView(vp: Viewport) {
    IModelApp.tools.run("View.Fit", vp, true);
  }

  public static async explodeElements(vp: Viewport, elementIds: string[], explosionFactor: number, tileVersion: TileVersionInfo): Promise<void> {
    const provider = ExplodeApp.getOrCreateProvider(vp);
    const tileLoadedCallback = (element: ElementData) => {
      if (element.isLoaded)
        provider.addElementData(element);
    };
    const elements = await ExplodeApp.queryElements(vp, elementIds);
    ExplodeApp.populateData(elements, explosionFactor);
    // TODO: validate or remove
    DebuggerDecorator.setDebugDecorator(elements, vp);
    ExplodeApp.populateTileContent(vp, elements, tileVersion, tileLoadedCallback);
  }

  private static makeRequestId(): string {
    const requestId = requestIdSequence.next();
    if (requestId.done)
      return (-1).toString(16);
    return requestId.value.toString(16);
  }

  private static async populateTileContent(vp: Viewport, elements: ElementData[], tileVersion: TileVersionInfo, tileLoadedCallback?: (data: ElementData) => void) {
    elements.forEach((element) => {
      const pixelSize = getPixelSizeInMetersAtClosestPoint(vp, element);

      // Round down to the nearest power of ten.
      const toleranceLog10 = Math.floor(Math.log10(pixelSize));
      const formatVersion = IModelApp.tileAdmin.getMaximumMajorTileFormatVersion(tileVersion.formatVersion);

      const props: ElementGraphicsRequestProps = {
        id: this.makeRequestId(),
        elementId: element.id,
        toleranceLog10,
        formatVersion,
        location: element.transformWorld,
        // location: element.transformWorld.multiplyTransformTransform(element.transformExplode),
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

  private static populateData(elements: ElementData[], explosionFactor: number) {
    // Populate the data
    elements.forEach((element) => {
      const quaternion = Matrix3d.createFromQuaternion(Point4d.create(element.pitch, element.roll, element.yaw, 1));
      const transform = Transform.createOriginAndMatrix(Point3d.createFrom(element.origin), quaternion);
      const box = Range3d.create(element.bBoxHigh, element.bBoxLow);

      element.transformWorld = transform;
      element.boundingBox = box;
    });
    // Find the center of the range containing all element
    // Have to do it now, after the world transform is populated.
    const center = this.getRangeUnion(elements).center;
    // Create transform for "exploding" effect
    elements.forEach((element) => {
      // Create transform from center of mass outward from each element
      const vector = Vector3d.createFrom(center);
      // Not origin. "Center of the elements range"
      vector.subtractInPlace(element.origin);
      vector.scaleInPlace(explosionFactor);
      element.transformExplode = Transform.createTranslation(vector);
    });
  }

  private static async queryElements(vp: Viewport, elementsIds: string[]): Promise<ElementData[]> {
    const query = `Select ECInstanceID,Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh FROM BisCore:GeometricElement3d WHERE ECInstanceID IN (${elementsIds.join(",")})`;
    const results = vp.iModel.query(query);
    const data: ElementData[] = [];
    let row = await results.next();
    while (row.value) {
      const element = (row.value as ElementData);
      element.isLoaded = false;

      data.push(element);
      row = await results.next();
    }

    return data;
  }

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

class ExplodeProvider implements TiledGraphicsProvider, FeatureOverrideProvider {
  private static _instances = new Map<number, ExplodeProvider>();
  private _data: ElementData[] = [];
  public static getOrCreate(vp: Viewport) {
    let provider = ExplodeProvider._instances.get(vp.viewportId);
    if (!provider)
      provider = ExplodeProvider.createAndAdd(vp);
    return provider;
  }
  public static createAndAdd(vp: Viewport) {
    const provider = new ExplodeProvider(vp);
    ExplodeProvider._instances.set(vp.viewportId, provider);
    provider.add(vp);
    return provider;
  }
  public add(vp: Viewport) {
    if (!vp.hasTiledGraphicsProvider(this)) {
      vp.addTiledGraphicsProvider(this);
      vp.addFeatureOverrideProvider(this);
    }
  }
  public drop() {
    this.vp.dropFeatureOverrideProvider(this);
    this.vp.dropTiledGraphicsProvider(this);
  }
  public addElementData(data: ElementData) {
    this._data.push(data);
    this.vp.setFeatureOverrideProviderChanged();
  }
  public clearElementData() {
    this._data = [];
    this.vp.setFeatureOverrideProviderChanged();
  }
  private constructor(public vp: Viewport) { }

  public addFeatureOverrides(overrides: FeatureSymbology.Overrides, _vp: Viewport): void {
    const app = FeatureAppearance.fromTransparency(1);
    this._data.forEach((element) => {
      overrides.overrideElement(element.id, app, true);
    });
  }

  /** Apply the supplied function to each [[TileTreeReference]] to be drawn in the specified [[Viewport]]. */
  public forEachTileTreeRef(viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    viewport.view.forEachTileTreeRef(func);
  }

  public addToScene(output: SceneContext): void {
    const vp = output.viewport;
    const branch = new GraphicBranch();
    const overrides = new FeatureSymbology.Overrides(vp);
    const app = FeatureAppearance.fromTransparency(0);
    this._data.forEach((element) => {
      if (undefined === element.tile.graphic)
        return;
      overrides.overrideElement(element.id, app, true);
      branch.add(element.tile.graphic);
      // branch.entries.push(element.tile.graphic);
    });
    branch.symbologyOverrides = overrides;
    output.outputGraphic(IModelApp.renderSystem.createGraphicBranch(branch, Transform.createIdentity(), {}));
    console.debug(branch, output.scene.foreground);
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

  private _range: Range3d;
  private constructor(public data: ElementData[]) {
    console.debug("Debug");
    this._range = ExplodeApp.getRangeUnion(this.data);
  }

  public decorate(context: DecorateContext) {
    // Mark union of areas.
    const builder = context.createGraphicBuilder(GraphicType.Scene);
    builder.addRangeBox(this._range);
    context.addDecorationFromBuilder(builder);
    // Mark center of explode point
    const pointPlacer = context.createGraphicBuilder(GraphicType.WorldOverlay);
    pointPlacer.addPointString([this._range.center]);
    context.addDecorationFromBuilder(pointPlacer);
  }
}
