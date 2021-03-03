/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import { Point3d, Range2d, Transform } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { Button, Select, Slider, Toggle } from "@bentley/ui-core";
import { ControlPane } from "common/ControlPane/ControlPane";
import "common/samples-common.scss";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import { FireDecorator } from "./Particle";
import FireDecorationApp from "./ParticleSampleApp";

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

/** Corresponded to FireParams from Particle.ts. */
interface FireProps {
  particleNumScale: number;
  height: number;
  effectRange: Range2d; // Assumed to be a square.
  enableSmoke: boolean;
  isOverlay: boolean;
}

/** A React component that renders the UI specific for this sample */
export default class FireDecorationUI extends React.Component<ParticleSampleProps, ParticleSampleState> {
  private readonly _lampElementIds = ["0x3a5", "0x1ab", "0x32b", "0x2ab", "0x22b"];
  private readonly _defaultProps: FireProps = {
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
      paramsName: FireDecorationApp.predefinedParams.keys().next().value,
    };
  }

  public componentDidMount() {
    FireDecorationApp.initTools();

    FireDecorationApp.highlighter.enable(true);
  }

  public componentWillUnmount() {
    FireDecorationApp.highlighter.enable(false);
  }

  /** Starts a tool that will place a new emitter. */
  private readonly startPlacementTool = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return;
    FireDecorationApp.startPlacementTool(async (point: Point3d) => {
      const params = FireDecorationApp.predefinedParams.get(this.state.paramsName);
      assert(params !== undefined, "Value is set based on keys of map.");
      const emitter = await FireDecorator.create(vp, point, params);
      this.setState({ emitter });
    });
  }

  /** Starts a tool that will select for configuration a previously placed tool. */
  private readonly startSelectionTool = () => {
    FireDecorationApp.startSelectTool((point) => {
      const emitter = FireDecorationApp.getClosestEmitter(point);
      this.setState({ emitter });
    });
  }

  /** Deletes the selected fire decorator emitter. */
  private readonly dropSelected = () => {
    this.state.emitter?.dispose();
    this.setState({ emitter: undefined });
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
          <Select options={[...FireDecorationApp.predefinedParams.keys()]} value={this.state.paramsName} onChange={(event) => this.setState({ paramsName: event.target.value })} />
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
        {/* The UI of this sample assumes effectRange is a square. */}
        <Slider min={0} max={6} step={0.2} values={[currentParams.effectRange.xLength()]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => this.configureEmitter({ effectRange: this.createSquareRange2d(values[0]) })} />
        <label>Smoke</label>
        <Toggle isOn={currentParams.enableSmoke} disabled={noEmitterSelected} onChange={(checked) => this.configureEmitter({ enableSmoke: checked })} />
        <label>Overlay Graphics</label>
        <Toggle isOn={currentParams.isOverlay} disabled={noEmitterSelected} onChange={(checked) => this.configureEmitter({ isOverlay: checked })} />
        <Button disabled={noEmitterSelected} onClick={this.dropSelected}> Drop Emitter</Button>
      </div>
    </>);
  }

  /** Configures the selected fire decorator. */
  private configureEmitter(params: Partial<FireProps>) {
    if (!this.state.emitter)
      return;
    this.state.emitter.configure(params);
  }

  /** Creates a square 2d range with a given length. */
  private createSquareRange2d(length: number): Range2d {
    const half = length / 2;
    return Range2d.createXYXY(-half, -half, half, half);
  }

  /** Is called by the showcase with then iModel is ready. */
  private onIModelReady = (_iModel: IModelConnection) => {
    if (this.props.iModelName !== "Villa") {
      this.setState({ isLoading: false });
      return;
    }
    IModelApp.viewManager.onViewOpen.addOnce((viewport) => {

      FireDecorationApp.queryElements(viewport.iModel, this._lampElementIds).then(async (results) => {
        const params = FireDecorationApp.predefinedParams.get("Candle") ?? FireDecorationApp.predefinedParams.keys().next().value;
        results.forEach((source, index) => {
          if (index === 0) {
            let volume = source.bBox.clone();
            // Manipulate the volume that the viewport will zoom to.
            volume.scaleAboutCenterInPlace(5);
            volume = Transform.createTranslationXYZ(0, 0, volume.zLength() * 0.25).multiplyRange(volume);
            viewport.zoomToVolume(volume);
          }
          FireDecorator.create(viewport, source.origin, params);
        });
        this.setState({ isLoading: false });
      });
    });
  }

  /** An overridden React method that is called when there's an update to the react component (e.g. this.setState). */
  public componentDidUpdate(_prevProps: any, _preState: ParticleSampleState) {
    FireDecorationApp.highlightEmitter(this.state.emitter);
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use the button to create a new fire particle emitter.  Use the drop down change the base params for new emitters.  Use the controls to configure the selected emitter." controls={this.getControls()} iModelSelector={this.props.iModelSelector} />
        { /* Viewport to display the iModel */}
        <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }

}
