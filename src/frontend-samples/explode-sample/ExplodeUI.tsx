/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ByteStream } from "@bentley/bentleyjs-core";
import { Matrix3d, Point3d, Point4d, Range3d, Transform, Vector3d } from "@bentley/geometry-core";
import { ElementGraphicsRequestProps, FeatureAppearance, IModelTileRpcInterface, TileVersionInfo } from "@bentley/imodeljs-common";
import { CoordSystem, DecorateContext, Decorator, EmphasizeElements, FeatureOverrideProvider, FeatureSymbology, GraphicBranch, GraphicType, ImdlReader, IModelApp, IModelConnection, SceneContext, ScreenViewport, TileContent, TiledGraphicsProvider, TileRequest, TileTreeReference, Viewport } from "@bentley/imodeljs-frontend";
import { Button, Slider } from "@bentley/ui-core";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";

interface SampleProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

export interface ExplodeObject {
  name: string;
  elements: string[];
}
interface ExplodeState {
  object: ExplodeObject;
  explosionFactor: number;
}

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

class DebuggerDecorator implements Decorator {
  private _range: Range3d;
  constructor(public data: ElementData[]) {
    console.debug("Debug");
    this._range = getBBRange(this.data);
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

class ExplodeProvider implements TiledGraphicsProvider, FeatureOverrideProvider {
  // private _instance: this;
  private _data: ElementData[] = [];
  public static createAndAdd(vp: Viewport) {
    const provider = new ExplodeProvider(vp);
    provider.add(vp);
    return provider;
  }
  public add(vp: Viewport) {
    vp.addTiledGraphicsProvider(this);
    vp.addFeatureOverrideProvider(this);
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

function* makeIdSequence() {
  let current = 0;
  while (true) {
    current %= Number.MAX_SAFE_INTEGER;
    yield ++current;
  }
}

const requestIdSequence = makeIdSequence();

export default class ExplodeUI extends React.Component<SampleProps, ExplodeState> {
  private _tileVersion: TileVersionInfo | undefined;
  private makeRequestId(): string {
    const requestId = requestIdSequence.next();
    if (requestId.done)
      return (-1).toString(16);
    return requestId.value.toString(16);
  }

  public state: ExplodeState;
  private explodeProvider?: ExplodeProvider;
  private _objects: ExplodeObject[] = [
    {
      name: "Lamp",
      elements: ["0x20000000fdc", "0x20000000fe1", "0x20000000fe0", "0x20000000fde", "0x20000000fdf", "0x20000000fdd", "0x20000000fe2", "0x20000000fda", "0x20000000fdb", "0x20000000fe3"],
    },
    {
      name: "Table",
      elements: ["0x200000009b5", "0x200000009b4", "0x200000009af", "0x200000009ae", "0x200000009b1", "0x200000009b0", "0x200000009b3", "0x200000009b2", "0x200000009ac", "0x200000009ad", "0x200000009a9", "0x200000009aa", "0x200000009ab"],
    },
  ];

  constructor(props: SampleProps) {
    super(props);
    this.state = {
      object: this._objects[0],
      explosionFactor: 1,
    };
  }

  private async queryElements(vp: Viewport, elementsIds: string[]) {
    const query = `Select ECInstanceID,Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh FROM BisCore:GeometricElement3d WHERE ECInstanceID IN (${elementsIds.join(",")})`;
    const results = vp.iModel.query(query);
    const data: ElementData[] = [];
    let row = await results.next();
    while (row.value) {
      // console.debug(row.value as ElementData);
      const value = row.value;
      const quaternion = Matrix3d.createFromQuaternion(Point4d.create(value.pitch, value.roll, value.yaw, 1));
      const transform = Transform.createOriginAndMatrix(Point3d.createFrom(value.origin), quaternion);
      const box = Range3d.create(value.bBoxHigh, value.bBoxLow);

      (value as ElementData).transformWorld = transform;
      (value as ElementData).boundingBox = box;
      (value as ElementData).isLoaded = false;
      data.push(value as ElementData);

      row = await results.next();
    }

    const areaBB = getBBRange(data);
    const center = areaBB.center;

    // Create transform from center of mass outward from each element
    data.forEach((v) => {
      const vector = Vector3d.createFrom(center);
      // Not origin. "Center of the elements range"
      vector.subtractInPlace(v.origin);
      vector.scaleInPlace(this.state.explosionFactor);
      v.transformExplode = Transform.createTranslation(vector);
    });
    return data;
  }

  /** Compute the size in meters of one pixel at the point on the tile's bounding sphere closest to the camera. */
  public getPixelSizeInMetersAtClosestPoint(vp: Viewport, element: ElementData): number {

    const radius = (element.boundingBox.maxLength() ?? 0) / 2;
    const center = Point3d.createFrom(element.origin);

    const pixelSizeAtPt = this.computePixelSizeInMetersAtClosestPoint(vp, center, radius);
    return 0 !== pixelSizeAtPt ? vp.target.adjustPixelSizeForLOD(pixelSizeAtPt) : 1.0e-3;
  }

  /** Compute the size in meters of one pixel at the point on a sphere closest to the camera.
   * Device scaling is not applied.
   */
  protected computePixelSizeInMetersAtClosestPoint(vp: Viewport, center: Point3d, radius: number): number {
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

  // Start explode process
  public initExplode(vp: ScreenViewport, data: ElementData[]) {
    data.forEach((element) => {
      const pixelSize = this.getPixelSizeInMetersAtClosestPoint(vp, element);

      // Round down to the nearest power of ten.
      const toleranceLog10 = Math.floor(Math.log10(pixelSize));
      const formatVersion = IModelApp.tileAdmin.getMaximumMajorTileFormatVersion(this._tileVersion?.formatVersion);

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
      IModelApp.tileAdmin.requestElementGraphics(vp.iModel, props)
        .then((response: TileRequest.ResponseData | undefined) => {
          if (!response) return;
          this.readResponse(vp, response).then((content) => {
            element.tile = content;
            this.explodeProvider!.addElementData(element);
          });
        });
    });
    // vp.addFeatureOverrideProvider();
    IModelApp.viewManager.addDecorator(new DebuggerDecorator(data));
    vp.invalidateDecorations();
  }

  public async readResponse(vp: Viewport, response: TileRequest.ResponseData): Promise<TileContent> {
    const stream = new ByteStream((response as Uint8Array).buffer);

    const position = stream.curPos;
    // const format = stream.nextUint32;
    stream.curPos = position;

    // ###TODO: IModelGraphics format wraps IModel format.
    // if (TileFormat.IModel !== format) return;

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

  public initObject(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.isolateElements(this.state.object.elements, vp, true);
    IModelApp.tools.run("View.Fit", vp, true);
    this.queryElements(vp, this.state.object.elements)
      .then(async (data) => {
        this.initExplode(vp, data);
      });
  }
  public clearEmph(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearIsolatedElements(vp);
    IModelApp.tools.run("View.Fit", vp, true);
  }
  public clearExplode(_vp: ScreenViewport) {
    if (!this.explodeProvider) return;
    this.explodeProvider.drop();
  }

  public getControls(): React.ReactChild {
    return <>
      <Button onClick={() => {
        const vp = IModelApp.viewManager.selectedView;
        if (!vp) return;
        if (this.explodeProvider)
          this.explodeProvider.add(vp);
        else
          this.initObject(vp);
      }}>Explode</Button>
      <Button onClick={() => {
        const vp = IModelApp.viewManager.selectedView;
        if (!vp) return;
        this.clearExplode(vp);
      }}>Clear Explode</Button>
      <Button onClick={() => {
        const vp = IModelApp.viewManager.selectedView;
        if (!vp) return;
        this.clearEmph(vp);
      }}>Clear Isolation</Button>
      <Slider min={0} max={2} values={[this.state.explosionFactor]} step={0.05} showMinMax={true} onChange={this.onSliderChange} />
      {/* <div dangerouslySetInnerHTML={{ __html: this.state.keyinField !== undefined ? this.state.keyinField.textBox.div.outerHTML : "" }} /> */}
    </>;
  }

  public readonly onIModelReady = (iModel: IModelConnection): void => {
    iModel.selectionSet.onChanged.addListener((ev) => { console.debug(ev.set.elements); });
    IModelTileRpcInterface.getClient().queryVersionInfo().then((value) => {
      // TODO: remove race condition
      this._tileVersion = value;
    });
    IModelApp.viewManager.onViewOpen.addOnce((vp) => {
      // (vp.view as ViewState3d).camera.setFrom(this._tableCamera.clone());
      this.explodeProvider = ExplodeProvider.createAndAdd(vp);
      this.initObject(vp);
    });
  }
  private readonly onSliderChange = (values: readonly number[]) => {
    const value = values[0];
    this.setState({ explosionFactor: value });
  }
  public componentDidUpdate(_prevProps: SampleProps, preState: ExplodeState) {
    const vp = IModelApp.viewManager.selectedView;
    if (!vp)
      return;
    let didUpdate = false;
    didUpdate = didUpdate || (preState.explosionFactor !== this.state.explosionFactor);
    didUpdate = didUpdate || (preState.object.name !== this.state.object.name);

    if (didUpdate)
      this.initObject(vp);
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Explode Sample" iModelSelector={this.props.iModelSelector} controls={this.getControls()} />
        { /* Viewport to display the iModel */}
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }
}
