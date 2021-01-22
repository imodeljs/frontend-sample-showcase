/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { DecorateContext, Decorator, EmphasizeElements, GraphicBuilder, GraphicType, IModelApp, IModelConnection, SceneContext, ScreenViewport, TiledGraphicsProvider, TileTreeReference, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { Button, Slider } from "@bentley/ui-core";
import { Box, Matrix3d, Point3d, Point4d, PolyfaceBuilder, Range3d, StrokeOptions, Transform, Vector3d, WritableXYAndZ, XYZProps } from "@bentley/geometry-core";
import { IModelTileRpcInterface } from "@bentley/imodeljs-common";

interface SampleProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface ExplodeObject {
  name: string;
  elements: string[];
}
interface ExplodeState {
  object: ExplodeObject;
  explosionFactor: number;
}

interface ElementData {
  origin: Point3d;
  bBoxHigh: Point3d;
  bBoxLow: Point3d;
  pitch: number;
  roll: number;
  yaw: number;

  boundingBox: Range3d;
  transformWorld: Transform;
  transformExplode: Transform;
}

function getBBRange(data: ElementData[]) {
  const allPoints: Point3d[] = [];
  data.forEach((v) => {
    allPoints.push(v.transformWorld.multiplyPoint3d(v.bBoxHigh));
    allPoints.push(v.transformWorld.multiplyPoint3d(v.bBoxLow));
  });
  return Range3d.create(...allPoints);
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

class ExplodeProvider implements TiledGraphicsProvider {
  constructor(public data: ElementData[]) { }

  /** Apply the supplied function to each [[TileTreeReference]] to be drawn in the specified [[Viewport]]. */
  public forEachTileTreeRef(viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    // const trpc = IModelTileRpcInterface.getClient();
    const foo = (ref: TileTreeReference) => {
      // const graphics = trpc.requestElementGraphics
      func(ref);
    };
    viewport.view.forEachTileTreeRef(foo);
  }
  public addToScene(_output: SceneContext): void {
    // output.
  }
}

export default class ExplodeUI extends React.Component<SampleProps, ExplodeState> {
  public state: ExplodeState;
  private _objects: ExplodeObject[] = [
    {
      name: "Lamp",
      elements: ["0x20000000fdc", "0x20000000fe1", "0x20000000fe0", "0x20000000fde", "0x20000000fdf", "0x20000000fdd", "0x20000000fe2", "0x20000000fda", "0x20000000fdb", "0x20000000fe3"],
    },
    {
      name: "Table",
      elements: ["0x200000009b5", "0x200000009b4", "0x200000009af", "0x200000009ae", "0x200000009b1", "0x200000009b0", "0x200000009b3", "0x200000009b2", "0x200000009ac", "0x200000009ad", "0x200000009a9", "0x200000009aa", "0x200000009ab"]
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
    const query = `Select Origin,Yaw,Pitch,Roll,BBoxLow,BBoxHigh FROM BisCore:GeometricElement3d WHERE ECInstanceID IN (${elementsIds.join(",")})`;
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
      data.push(value as ElementData);

      row = await results.next();
    }

    const areaBB = getBBRange(data);
    const center = areaBB.center;

    data.forEach((v) => {
      const vector = Vector3d.createFrom(center);
      // Not origin. "Center of the elements range"
      vector.subtractInPlace(v.origin);
      vector.scaleInPlace(this.state.explosionFactor);
      v.transformExplode = Transform.createTranslation(vector);
    });

    vp.addTiledGraphicsProvider(new ExplodeProvider(data));
    IModelApp.viewManager.addDecorator(new DebuggerDecorator(data));
    vp.invalidateDecorations();
    console.debug(data);
  }

  public initObject(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.isolateElements(this.state.object.elements, vp, true);
    IModelApp.tools.run("View.Fit", vp, true);
    this.queryElements(vp, this.state.object.elements);
    // vp.addTiledGraphicsProvider
  }
  public clearEmph(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearHiddenElements(vp);
    emph.clearIsolatedElements(vp);
    emph.clearOverriddenElements(vp);
    IModelApp.tools.run("View.Fit", vp, true);
  }

  public getControls(): React.ReactChild {
    return <>
      <Button onClick={() => {
        const vp = IModelApp.viewManager.selectedView;
        if (!vp) return;
        this.initObject(vp);
        this.queryElements(vp, this.state.object.elements);
      }}>Explode</Button>
      <Button onClick={() => {
        const vp = IModelApp.viewManager.selectedView;
        if (!vp) return;
        this.clearEmph(vp);
      }}>Clear Isolation</Button>
      <Slider min={0} max={2} values={[this.state.explosionFactor]} step={0.05} onChange={this.onSliderChange} />
    </>;
  }

  public readonly onIModelReady = (iModel: IModelConnection): void => {
    iModel.selectionSet.onChanged.addListener((ev) => { console.debug(ev.set.elements); });
    IModelApp.viewManager.onViewOpen.addOnce((vp) => {
      // (vp.view as ViewState3d).camera.setFrom(this._tableCamera.clone());
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
