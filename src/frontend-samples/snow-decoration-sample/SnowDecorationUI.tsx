/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, IModelConnection, Viewport } from "@bentley/imodeljs-frontend";
import { Button, Select, Slider, Toggle } from "@bentley/ui-core";
import { ControlPane } from "common/ControlPane/ControlPane";
import "common/samples-common.scss";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import SnowDecorationApp from "./SnowDecorationApp";
import { SnowParams } from "./SnowDecorator";

/** The React state for this UI component */
interface ParticleSampleState {
  viewport?: Viewport;
  propsName: string;
  wind: number;
  particleDensity: number;
  pauseEffect: boolean;
}
/** The React props for this UI component */
interface ParticleSampleProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** A React component that renders the UI specific for this sample */
export default class SnowDecorationUI extends React.Component<ParticleSampleProps, ParticleSampleState> {

  /** Creates a Sample instance */
  constructor(props: ParticleSampleProps) {
    super(props);
    this.state = {
      propsName: SnowDecorationApp.predefinedProps.keys().next().value,
      wind: 0,
      particleDensity: 0,
      pauseEffect: false,
    };
  }

  /** A React method that is called just before the sample is unmounted (dispose) */
  public componentWillUnmount() {
    SnowDecorationApp.dispose();
  }

  public getControls(): React.ReactNode {
    const windRange = 600;
    return (<>
      <div className={"sample-options-2col"}>
        <label>Select Effect</label>
        <Select options={[...SnowDecorationApp.predefinedProps.keys()]} value={this.state.propsName} onChange={(event) => this.setState({ propsName: event.target.value })} />
        <label>Pause Effect</label>
        <Toggle isOn={this.state.pauseEffect} onChange={(isChecked) => this.setState({ pauseEffect: isChecked })} />
        <label>Particle Density</label>
        <Slider min={0} max={0.01135} step={0.0001} values={[this.state.particleDensity]} onUpdate={(values) => this.setState({ particleDensity: values[0] })} />
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label>Wind</label>
          <Button onClick={() => this.setState({ wind: 0 })}>Zero</Button>
        </span>
        <Slider min={-windRange} max={windRange} values={[this.state.wind]} step={0.25} onUpdate={(values) => this.setState({ wind: values[0] })} />
      </div>
    </>);
  }

  /** Configures active snow decorators (should only ever be one in this sample). */
  private configureEffect(params: Partial<SnowParams> & { pauseEffect?: boolean }) {
    SnowDecorationApp.getSnowDecorators().forEach((decorator) => {
      // if there is an update to the, a texture may need to be updated too.
      if (params.windVelocity !== undefined) {
        const prevWind = decorator.getParams().windVelocity;
        // test if the wind has changed
        if (params.windVelocity !== prevWind) {
          // test if the texture has changed
          const url = SnowDecorationApp.testForTextureUpdate(this.state.propsName, params.windVelocity, prevWind);
          if (url) {
            // Set new texture
            SnowDecorationApp.allocateTextureFromUrl(url).then((texture) => {
              decorator.changeTexture(texture);
            });
          }
        }
      }
      // Update if it is paused.
      if (params.pauseEffect !== undefined)
        decorator.pause = params.pauseEffect;
      // Configure the decorator
      decorator.configure(params);
    });
  }

  /** Is called by the showcase with then iModel is ready. */
  private onIModelReady = (_iModel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport) => {
      this.setState({ viewport });
    });
  };

  /** An overridden React method that is called when there's an update to the react component (e.g. this.setState). */
  public componentDidUpdate(_prevProps: any, prevState: ParticleSampleState) {
    if (undefined === this.state.viewport)
      return;

    if (prevState.viewport !== this.state.viewport || prevState.propsName !== this.state.propsName) {
      const props = SnowDecorationApp.predefinedProps.get(this.state.propsName)!;
      SnowDecorationApp.createSnowDecorator(this.state.viewport, props);
      this.setState({
        wind: props.params.windVelocity,
        particleDensity: props.params.particleDensity,
        pauseEffect: false, // this is false by default in the decorator
      });
    }
    if (prevState.particleDensity !== this.state.particleDensity)
      this.configureEffect({ particleDensity: this.state.particleDensity });
    if (prevState.wind !== this.state.wind)
      this.configureEffect({ windVelocity: this.state.wind });
    if (prevState.pauseEffect !== this.state.pauseEffect)
      this.configureEffect({ pauseEffect: this.state.pauseEffect });
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use the drop down to change the presets used for the decorator." controls={this.getControls()} iModelSelector={this.props.iModelSelector} />
        { /* Viewport to display the iModel */}
        <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }

}
