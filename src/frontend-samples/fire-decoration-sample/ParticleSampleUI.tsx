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
interface ParticleSampleState extends FireProps {
  isLoading: boolean;
  selectedEmitter?: FireDecorator;
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
  private _dropListeners: VoidFunction[] = [];
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
      ...this._defaultProps,
    };
  }

  /** A React method that is called when the sample is mounted (startup) */
  public componentDidMount() {
    FireDecorationApp.initTools();
    // Should allow for selecting the particles (but doesn't)
    IModelApp.locateManager.options.allowDecorations = true;
    IModelApp.viewManager.addDecorator(FireDecorationApp.highlighter);
  }

  /** A React method that is called just before the sample is unmounted (disposed) */
  public componentWillUnmount() {
    // Resetting the IModelApp to the default state.
    IModelApp.locateManager.options.allowDecorations = false;
    this._dropListeners.flatMap((callback) => callback());
    this._dropListeners = [];
    IModelApp.viewManager.dropDecorator(FireDecorationApp.highlighter);
    // Listeners on the FireDecorator will be triggered when the sample is closing.  It will handle disposing itself.
  }

  /** Starts a tool that will place a new emitter. */
  private readonly startPlacementTool = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp === undefined)
      return;

    FireDecorationApp.startPlacementTool(async (point: Point3d) => {
      const params = FireDecorationApp.predefinedParams.get(this.state.paramsName);
      assert(params !== undefined, "Value is set based on keys of map.");
      const selectedEmitter = await FireDecorator.create(vp, point, params);
      this.setState({ selectedEmitter });
    });
  }

  /** Deletes the selected fire decorator emitter. */
  private readonly dropSelected = () => {
    this.state.selectedEmitter?.dispose();
    this.setState({ selectedEmitter: undefined });
  }

  /** Deletes all Decorates. */
  private readonly dropAllEmitters = () => {
    this.setState({ selectedEmitter: undefined });
    FireDecorator.dispose();
  }

  public getControls(): React.ReactNode {
    const noEmitterSelected = this.state.selectedEmitter === undefined;
    return (<>
      <div>
        <div className="sample-heading">
          <span>Place New Emitter</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Button disabled={this.state.isLoading} onClick={this.dropAllEmitters}>Delete All Emitters</Button>
        </div>
        <div className={"sample-options-2col"}>
          <Button disabled={this.state.isLoading} onClick={this.startPlacementTool}>Place</Button>
          <Select options={[...FireDecorationApp.predefinedParams.keys()]} value={this.state.paramsName} onChange={(event) => this.setState({ paramsName: event.target.value })} />
        </div>
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Configure Selected Emitter</span>
      </div>
      <div className={"sample-options-2col"}>
        <label>Particle Count</label>
        <Slider min={0} max={1} step={0.02} values={[this.state.particleNumScale]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => this.setState({ particleNumScale: values[0] })} />
        <label>Height</label>
        <Slider min={0} max={5} step={0.02} values={[this.state.height]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => this.setState({ height: values[0] })} />
        <label>Source Size</label>
        {/* The UI of this sample assumes effectRange is a square. */}
        <Slider min={0} max={6} step={0.2} values={[this.state.effectRange.xLength()]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => this.setState({ effectRange: this.createSquareRange2d(values[0]) })} />
        <label>Smoke</label>
        <Toggle isOn={this.state.enableSmoke} disabled={noEmitterSelected} onChange={(checked) => this.setState({ enableSmoke: checked })} />
        <label>Overlay Graphics</label>
        <Toggle isOn={this.state.isOverlay} disabled={noEmitterSelected} onChange={(checked) => this.setState({ isOverlay: checked })} />

      </div>
      <div style={{ display: "flex", justifyContent: "space-evenly" }}>
        <Button disabled={noEmitterSelected} onClick={this.dropSelected}>Drop</Button>
        <Button disabled={this.state.isLoading || noEmitterSelected} onClick={() => this.setState({ selectedEmitter: undefined })}>Deselect</Button>
      </div>
    </>);
  }

  /** Configures the selected fire decorator. */
  private configureEmitter(params: Partial<FireProps>) {
    if (!this.state.selectedEmitter)
      return;
    this.state.selectedEmitter.configure(params);
  }

  /** Creates a square 2d range with a given length. */
  private createSquareRange2d(length: number): Range2d {
    const half = length / 2;
    return Range2d.createXYXY(-half, -half, half, half);
  }

  /** Is called by the showcase with then iModel is ready. */
  private onIModelReady = (_iModel: IModelConnection) => {
    // Villa will have some decorators initially placed as a demo.
    if (this.props.iModelName === "Villa") {
      this._dropListeners.push(IModelApp.viewManager.onViewOpen.addOnce((viewport) => {

        // Query for element origin and bounding box.
        FireDecorationApp.queryElements(viewport.iModel, this._lampElementIds).then(async (results) => {
          const params = FireDecorationApp.predefinedParams.get("Candle") ?? FireDecorationApp.predefinedParams.keys().next().value;
          results.forEach((source, index) => {
            FireDecorator.create(viewport, source.origin, params);
            // If it's the first place, zoom to it.
            if (index === 0) {
              let volume = source.bBox.clone();
              // Manipulate the volume that the viewport will zoom to.
              volume.scaleAboutCenterInPlace(5);
              volume = Transform.createTranslationXYZ(0, 0, volume.zLength() * 0.25).multiplyRange(volume);
              viewport.zoomToVolume(volume);
            }
          });
        });
      }));
    }
    this.setState({ isLoading: false });
  }

  /** An overridden React method that is called when there's an update to the react component (e.g. this.setState). */
  public componentDidUpdate(_prevProps: any, preState: ParticleSampleState) {
    FireDecorationApp.highlightEmitter(this.state.selectedEmitter);
    if (this.state.selectedEmitter !== preState.selectedEmitter) {
      const currentParams: FireProps = this.state.selectedEmitter?.params ?? this._defaultProps;
      this.setState({ ...currentParams });
    } else {
      this.configureEmitter(this.state);
    }
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
