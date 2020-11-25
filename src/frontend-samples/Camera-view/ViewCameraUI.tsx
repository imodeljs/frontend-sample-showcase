/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, IModelConnection, Viewport, ViewState, ViewState3d } from "@bentley/imodeljs-frontend";
import { Select, Toggle } from "@bentley/ui-core";
import { RenderMode } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import ViewCameraApp, { CameraPoint, AttrValues } from "./ViewCameraApp";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Point3d } from "@bentley/geometry-core";
import * as data from './Coordinates.json';


// cSpell:ignore imodels
/** The React state for this UI component */
interface ViewAttributesState {
  vp?: Viewport;
  attrValues: AttrValues;
  PathArray: CameraPoint[];
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
      }, PathArray: []
    };


    this.animateCameraPlay = this.animateCameraPlay.bind(this);
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
      Path1: "Path 1",
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
    const element = <input type={"range"} min={0} max={this.state.PathArray.length - 1} value={ViewCameraApp.countPathTravelled} style={{ marginLeft: "76px" }}
    //  onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
    //   //   if (this.state.vp) {

    //   //     console.log(event);
    //   //     //  ViewCameraApp._isPaused = true;
    //   //     ViewCameraApp.moveCameraPosition(this.state.vp, Math.abs(Number(event.target.value)), this);
    //   //   }
    />;
    return this.createJSXElementForAttribute(label, info, element);
  }



  // Create the react component for the  Play button
  private async animateCameraPlay() {
    if (undefined === this.state.vp)
      return;
    if (!ViewCameraApp.isInitialPositionStarted) {
      for (let i: number = 0; i < this.state.PathArray.length; i++) {
        this.state.PathArray[i].isTraversed = false;
      }
      ViewCameraApp.countPathTravelled = 0;
      ViewCameraApp.isInitialPositionStarted = true;
    }

    else {
      ViewCameraApp.isPaused = !ViewCameraApp.isPaused;
    }
    ViewCameraApp.animateCameraPath(this.state.vp, this, this.state.PathArray);
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
          <button style={{ width: "35px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={this.animateCameraPlay} >{ViewCameraApp.isInitialPositionStarted ? ViewCameraApp.isPaused ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
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
      ViewCameraApp.countPathTravelled = 0;
      var cameraPoints: CameraPoint[] = [];
      for (let i: number = 0; i < data.cooordinatesArray.length; i++) {
        for (let j: number = 0.00; j <= 1.0; j = j + 0.003) {
          cameraPoints.push({ Point: new Point3d(data.cooordinatesArray[i].InitialPoint.x, data.cooordinatesArray[i].InitialPoint.y, data.cooordinatesArray[i].InitialPoint.z).interpolate(j, new Point3d(data.cooordinatesArray[i].FinalPoint.x, data.cooordinatesArray[i].FinalPoint.y, data.cooordinatesArray[i].FinalPoint.z)), Direction: new Point3d(data.cooordinatesArray[i].ViewDirection.x, data.cooordinatesArray[i].ViewDirection.y, data.cooordinatesArray[i].ViewDirection.z), isTraversed: false });
        }
      }
      this.setState({ vp, PathArray: cameraPoints });
    });
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    viewState.viewFlags.renderMode = RenderMode.SmoothShade;
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
