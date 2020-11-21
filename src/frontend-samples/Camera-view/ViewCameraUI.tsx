/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, IModelConnection, RotateViewTool, Viewport, ViewState, ViewState3d } from "@bentley/imodeljs-frontend";
import { Select, Toggle } from "@bentley/ui-core";
import { RenderMode } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import ViewCameraApp, { AttrValues } from "./ViewCameraApp";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Angle, Vector3d } from "@bentley/geometry-core";


// cSpell:ignore imodels
/** The React state for this UI component */
interface ViewAttributesState {
  vp?: Viewport;
  attrValues: AttrValues;
}

/** A React component that renders the UI specific for this sample */
export default class ViewCameraUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, ViewAttributesState> {

  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      attrValues: {
        locationOn: false,
        positionOn: false,
        isPause: false,
      },
    };

    this.createPlay = this.createPlay.bind(this);
  }


  // This common function is used to create the react components for each row of the UI.
  private createJSXElementForAttribute(label: string, info: string, element: JSX.Element) {
    return (
      <>
        <span style={{ marginRight: "-15px" }}><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  }


  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.vp)
      return;

    switch (event.target.value) {

    }

  }

  // Create the react components for the render Path
  private createRenderPath(label: string, info: string) {
    const options = {
      HiddenLine: "Path 1",
    }

    const element = <Select style={{ width: "fit-content", marginLeft: "41px" }} onChange={this._onChangeRenderPath} options={options} />;
    return this.createJSXElementForAttribute(label, info, element);
  }



  // Create the react components for the  Location toggle .
  private createLocationToggle(label: string, info: string) {
    const element = <Toggle isOn={this.state.attrValues.locationOn} style={{ marginLeft: "-15px" }} />;
    return this.createJSXElementForAttribute(label, info, element);
  }



  // Create the react components for the Position toggle row.
  private createPositionToggle(label: string, info: string) {
    const element = <Toggle isOn={this.state.attrValues.positionOn} style={{ marginLeft: "-15px" }} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Create the react component for the  slider
  private createCameraSlider(label: string, info: string) {
    const element = <input type={"range"} min={0} max={ViewCameraApp.totalArrayLength} value={ViewCameraApp.count} style={{ marginLeft: "76px" }} onChange={() => {
      if (this.state.vp) {
      }
    }} />;
    return this.createJSXElementForAttribute(label, info, element);
  }



  // Create the react component for the  Play button
  private async createPlay() {
    if (undefined === this.state.vp)
      return;
    if (this.state.vp) {
      if (!ViewCameraApp.isInitialPositionStarted) {
        ViewCameraApp.count = 0;
        this.setState({ attrValues: { positionOn: this.state.attrValues.positionOn, locationOn: this.state.attrValues.locationOn, isPause: this.state.attrValues.isPause } });

        for (var i: number = 0; i < ViewCameraApp.cooordinatesArray1.length; i++) {
          ViewCameraApp.cooordinatesArray1[i].isTraversed = false;
        }

        for (var i: number = 0; i < ViewCameraApp.cooordinatesArray2.length; i++) {
          ViewCameraApp.cooordinatesArray2[i].isTraversed = false;
        }

        for (var i: number = 0; i < ViewCameraApp.cooordinatesArray3.length; i++) {
          ViewCameraApp.cooordinatesArray3[i].isTraversed = false;
        }

        for (var i: number = 0; i < ViewCameraApp.cooordinatesArray4.length; i++) {
          ViewCameraApp.cooordinatesArray4[i].isTraversed = false;
        }

        for (var i: number = 0; i < ViewCameraApp.cooordinatesArray5.length; i++) {
          ViewCameraApp.cooordinatesArray5[i].isTraversed = false;
        }

        for (var i: number = 0; i < ViewCameraApp.cooordinatesArray6.length; i++) {
          ViewCameraApp.cooordinatesArray6[i].isTraversed = false;
        }
        for (var i: number = 0; i < ViewCameraApp.cooordinatesArray7.length; i++) {
          ViewCameraApp.cooordinatesArray7[i].isTraversed = false;
        }

        for (var i: number = 0; i < ViewCameraApp.cooordinatesArray8.length; i++) {
          ViewCameraApp.cooordinatesArray8[i].isTraversed = false;
        }

        (this.state.vp.view as ViewState3d).setEyePoint({ x: -9.786457495926177, y: 15.068731707039595, z: -8.449572251798894 });
        this.state.vp.synchWithView();
        if (!ViewCameraApp.isRotationStarted) {
          (this.state.vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-60), new Vector3d(0, 0, 1));
          ViewCameraApp.isRotationStarted = true;
        }
        else {
          (this.state.vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-ViewCameraApp.degreesRotated), new Vector3d(0, 0, 1));
          ViewCameraApp.degreesRotated = 0.0;
          //  (this.state.vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-60), new Vector3d(0, 0, 1));
        }
        this.state.vp.synchWithView();
        ViewCameraApp.isInitialPositionStarted = true;
        await ViewCameraApp.delay(1000);
      }

      else {
        ViewCameraApp.isPaused = !ViewCameraApp.isPaused;
        this.setState({ attrValues: { positionOn: this.state.attrValues.positionOn, locationOn: this.state.attrValues.locationOn, isPause: !this.state.attrValues.isPause } });
      }
      ViewCameraApp.setPlay(this.state.vp, this);
    }
  }

  public updateTimeline() {
    this.setState({ attrValues: { positionOn: this.state.attrValues.positionOn, locationOn: this.state.attrValues.locationOn, isPause: this.state.attrValues.isPause } });
  }
  public getControls(): React.ReactNode {
    return (
      <div>
        <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
          {this.createRenderPath("Path", "Path")}
        </div>
        <div className="sample-options-3col" style={{ maxWidth: "350px" }}>
          {this.createCameraSlider("Timeline", "Timeline")}
          <button style={{ width: "35px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={this.createPlay} >{ViewCameraApp.isInitialPositionStarted ? ViewCameraApp.isPaused ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
        </div>
        <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {this.createLocationToggle("Unlock Location", "Unlock Location")}
          {this.createPositionToggle("Unlock Position", "Unlock Position")}
        </div >
      </div >

    );
  }

  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      ViewCameraApp.isInitialPositionStarted = false;
      ViewCameraApp.isPaused = false;
      ViewCameraApp.isRotationStarted = false;
      ViewCameraApp.degreesRotated = 0.0;
      ViewCameraApp.count = 0;
      this.setState({ vp });
    });
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    viewState.viewFlags.renderMode = RenderMode.Wireframe;
    return viewState;
  }



  /** The sample's render method */
  public render() {

    return (
      <>
        <ControlPane instructions="Use the timeline slider to drive the camera along the predefined path." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} />
      </>
    );
  }

}
