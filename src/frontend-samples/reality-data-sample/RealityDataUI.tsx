/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import { IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import RealityDataApp from "./RealityDataApp";

interface RealityDataState {
  imodel?: IModelConnection;
  showRealityData: boolean;
}

export default class RealityDataUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, RealityDataState> {
  /** Creates a sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      showRealityData: true,
    };
  }

  public async componentDidUpdate(_prevProps: {}, prevState: RealityDataState) {
    if (prevState.showRealityData !== this.state.showRealityData) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp)
        await RealityDataApp.toggleRealityModel(this.state.showRealityData, vp, this.state.imodel!);
    }
  }

  // Create the react components for the toggle
  private createToggle(label: string, info: string) {
    const show: boolean = this.state.showRealityData;

    const element = <Toggle isOn={show} onChange={async (checked: boolean) => this._onChangeToggle(checked)} />;
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  }

  // Create the react component for the transparency slider
  private createTransparencySlider(label: string, info: string) {
    const vp = IModelApp.viewManager.selectedView;
    if (vp) {
      const element = <input type={"range"} min={0} max={99} defaultValue={99} onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (vp)
          // The calculation used here converts the whole number range 0 to 99 into a range from 1 to 0
          // This allows the rightmost value of the slider to be opaque, while the leftmost value is completely transparent
          await RealityDataApp.setRealityDataTransparency(vp, Math.abs((Number(event.target.value) / 100) - 1));
      }} />;
      return (
        <>
          <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
          {element}
        </>
      );
    }
    return (<></>);
  }

  // Handle changes to the toggle.
  private _onChangeToggle = async (checked: boolean) => {
    this.setState({ showRealityData: checked });
  }

  /**
   * This callback will be executed by SandboxViewport once the iModel has been loaded.
   * The reality models will default to on.
   */
  private _onIModelReady = (imodel: IModelConnection) => {
    this.setState({ imodel });

    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      this.setState({ imodel, showRealityData: true });
      await RealityDataApp.toggleRealityModel(true, _vp, imodel);
    });
  }

  private getControls(): React.ReactNode {
    return (
      <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {this.createToggle("Reality Data", "Toggle showing the reality data in the model.")}
        {this.createTransparencySlider("Reality Data Transparency", "Adjusting this slider changes the transparency of the reality data. Does not apply if reality data is not currently being displayed.")}
      </div>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Display the instructions and iModelSelector for the sample on a control pane */}
        <ControlPane instructions="Use the toggle below for displaying the reality data in the model." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        { /* Viewport to display the iModel */}
        <SandboxViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
