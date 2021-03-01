/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import { Point3d, Range1d, Range2d, Range3d, Vector3d } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { Button, Select, Slider, Toggle } from "@bentley/ui-core";
import { ViewSetup } from "api/viewSetup";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { PlaceMarkerTool } from "frontend-samples/marker-pin-sample/PlaceMarkerTool";
import * as React from "react";
import { FireDecorator, FireParams } from "./Particle";
import FireDecorationApp from "./ParticleSampleApp";

// cSpell:ignore imodels
/** The React state for this UI component */
interface ParticleSampleState {
  isLoading: boolean;
  emitter?: FireDecorator;
  paramsName: string;
}
interface ParticleSampleProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface FireProps {
  particleNumScale: number;
  height: number;
  effectRange: Range2d;
  enableSmoke: boolean;
  isOverlay: boolean;
}

const predefinedParams = new Map<string, FireParams>(
  [
    [
      "Candle",
      {
        particleNumScale: 0.02,
        sizeRange: Range1d.createXX(0.01, 0.2),
        transparencyRange: Range1d.createXX(0, 50),
        velocityRange: new Range3d(-.01, .5, -.01, .5, -.01, .5),
        accelerationRange: new Range3d(-1, -0.25, 1, 0.25, 1, 0.25),
        windVelocity: 0,
        windDirection: Vector3d.createZero(),
        effectRange: new Range2d(0, 0, 0, 0),
        height: 0.2,
        isOverlay: false,
        enableSmoke: false,
        smokeSizeRange: Range1d.createXX(0.1, 0.25),
      },
    ],
    [
      "Camp Fire",
      {
        particleNumScale: 0.2,
        sizeRange: Range1d.createXX(0.01, 0.2),
        transparencyRange: Range1d.createXX(0, 50),
        velocityRange: new Range3d(-.01, .5, -.01, .5, -.01, .5),
        accelerationRange: new Range3d(-1, -0.25, 1, 0.25, 1, 0.25),
        windVelocity: 0.1,
        windDirection: Vector3d.unitX(),
        effectRange: new Range2d(-0.5, -0.5, 0.5, 0.5),
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
        velocityRange: new Range3d(-.01, .5, -.01, .5, -.01, .5),
        accelerationRange: new Range3d(-1, -0.25, 1, 0.25, 1, 0.25),
        windVelocity: 0.1,
        windDirection: Vector3d.unitX(),
        effectRange: new Range2d(-3, -3, 3, 3),
        height: 2,
        isOverlay: false,
        enableSmoke: true,
        smokeSizeRange: Range1d.createXX(0.1, 0.25),
      },
    ],
  ],
);

/** A React component that renders the UI specific for this sample */
export default class FireDecorationUI extends React.Component<ParticleSampleProps, ParticleSampleState> {

  private _defaultProps: FireProps = {
    particleNumScale: 0,
    height: 0,
    effectRange: Range2d.createXYXY(0, 0, 0, 0),
    enableSmoke: false,
    isOverlay: false,
  };

  /** Creates a Sample instance */
  constructor(props: ParticleSampleProps) {
    super(props);
    this.state = {
      isLoading: true,
      paramsName: predefinedParams.keys().next().value,
    };
  }

  private readonly startPlacementTool = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return;
    IModelApp.tools.run(PlaceMarkerTool.toolId, async (point: Point3d) => {
      const params = predefinedParams.get(this.state.paramsName);
      assert(params !== undefined, "Value is set based on keys of map.");
      const emitter = await FireDecorator.create(vp, point, params);
      this.setState({ emitter });
    });
  }

  private readonly dropSelected = () => {
    this.state.emitter?.dispose();
    this.setState({ emitter: undefined });
  }
  private readonly startSelectionTool = () => {
    IModelApp.tools.run(PlaceMarkerTool.toolId, async (point: Point3d) => {
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
      this.setState({ emitter: min < targetRadius ? closestEmitter : undefined });
    });
  }

  public getControls(): React.ReactNode {
    const noEmitterSelected = this.state.emitter === undefined;
    const currentParams: FireProps = this.state.emitter?.params ?? this._defaultProps;
    return (<>
      <div>
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Button disabled={this.state.isLoading || FireDecorator.decorators.size <= 0} onClick={this.startSelectionTool}>Select Emitter</Button>
          <Button disabled={this.state.isLoading || noEmitterSelected} onClick={() => this.setState({ emitter: undefined })}>Deselect Emitter</Button>
        </div>
        <div className={"sample-options-2col"}>
          <Button disabled={this.state.isLoading} onClick={this.startPlacementTool}>Place Emitter</Button>
          <Select options={[...predefinedParams.keys()]} value={this.state.paramsName} onChange={(event) => this.setState({ paramsName: event.target.value })} />
        </div>
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Configure Emitter</span>
      </div>
      <div className={"sample-options-2col"}>
        <label>Particle Count</label>
        <Slider min={0} max={1} step={0.02} values={[currentParams.particleNumScale]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => this.configureEmitter({ particleNumScale: values[0] })} />
        <label>Height</label>
        <Slider min={0} max={5} step={0.02} values={[currentParams.height]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => this.configureEmitter({ height: values[0] })} />
        <label>Source Size</label>
        <Slider min={0} max={6} step={0.2} values={[currentParams.effectRange.xLength()]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => this.configureEmitter({ effectRange: this.createSquareRange2d(values[0]) })} />
        <label>Smoke</label>
        <Toggle isOn={currentParams.enableSmoke} disabled={noEmitterSelected} onChange={(checked) => this.configureEmitter({ enableSmoke: checked })} />
        <label>Overlay</label>
        <Toggle isOn={currentParams.isOverlay} disabled={noEmitterSelected} onChange={(checked) => this.configureEmitter({ isOverlay: checked })} />
        <Button disabled={noEmitterSelected} onClick={this.dropSelected}> Drop Emitter</Button>
      </div>
    </>);
  }

  private configureEmitter(params: Partial<FireProps>) {
    if (!this.state.emitter)
      return;
    this.state.emitter.configure(params);
  }

  private createSquareRange2d(length: number): Range2d {
    const half = length / 2;
    return Range2d.createXYXY(-half, -half, half, half);
  }

  // private _onUpdateParticleCount = (values: readonly number[]) => {

  // }

  private onIModelReady = (_imodel: IModelConnection) => {
    this.setState({ isLoading: false });
  }

  // public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
  //   const viewState = await ViewSetup.getDefaultView(imodel);
  //   // Make view edits here

  //   return viewState;
  // }

  public componentDidUpdate(_prevProps: any, _preState: ParticleSampleState) {
    FireDecorationApp.highlightEmitter(this.state.emitter);
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="click button to start fire." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }

}
