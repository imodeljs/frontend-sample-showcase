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
import ViewCameraApp, { CameraPoint, AttrValues } from "./AnimatedCameraApp";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Point3d, Vector3d } from "@bentley/geometry-core";
import { Coordinates } from './Coordinates';



// cSpell:ignore imodels
/** The React state for this UI component */
interface ViewAttributesState {
  vp?: Viewport;
  attrValues: AttrValues;
  PathArray: CameraPoint[];
}


/** A React component that renders the UI specific for this sample */
export default class AnimatedCameraUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, ViewAttributesState> {

  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);

    this.state = {
      attrValues: {
        locationOn: false,
        positionOn: false,
        isPause: false,
        sliderValue: 0
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
    const element = <input type={"range"} min={0} max={this.state.PathArray.length - 1} value={this.state.attrValues.sliderValue} style={{ marginLeft: "76px" }}
      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (this.state.vp) {
          var pathPaused: boolean = ViewCameraApp.isPaused;
          ViewCameraApp.isPaused = true;
          var sliderValue = Number(event.target.value);
          setTimeout(() => {
            (this.state.vp?.view as ViewState3d).lookAt(this.state.PathArray[sliderValue].Point, this.state.PathArray[sliderValue].Direction, new Vector3d(0, 0, 1), undefined, undefined, undefined, { animateFrustumChange: true });
            this.state.vp?.synchWithView();
            for (let i: number = 0; i <= sliderValue; i++) {
              this.state.PathArray[i].isTraversed = true;
            }
            ViewCameraApp.countPathTravelled = sliderValue + 1;
            for (let i: number = sliderValue + 1; i <= this.state.PathArray.length - 1; i++) {
              this.state.PathArray[i].isTraversed = false;
            }
            ViewCameraApp.isInitialPositionStarted = true;
            if (!pathPaused) {
              ViewCameraApp.isPaused = false;
              ViewCameraApp.animateCameraPath(this.state.vp, this, this.state.PathArray);
            }
            else {
              ViewCameraApp.countPathTravelled = sliderValue + 1;
              this.updateTimeline();
            }
          }, 2);
        }
      }
      } />;
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
    this.setState({ attrValues: { positionOn: this.state.attrValues.positionOn, locationOn: this.state.attrValues.locationOn, isPause: this.state.attrValues.isPause, sliderValue: ViewCameraApp.countPathTravelled } });
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
      let cameraPoints: CameraPoint[] = [];
      for (let i: number = 0; i < Coordinates.length; i++) {
        for (let j: number = 0.00; j <= 1.0; j = j + 0.003) {
          cameraPoints.push({ Point: new Point3d(Coordinates[i].InitialPoint.x, Coordinates[i].InitialPoint.y, Coordinates[i].InitialPoint.z).interpolate(j, new Point3d(Coordinates[i].FinalPoint.x, Coordinates[i].FinalPoint.y, Coordinates[i].FinalPoint.z)), Direction: new Point3d(Coordinates[i].ViewDirection.x, Coordinates[i].ViewDirection.y, Coordinates[i].ViewDirection.z), isTraversed: false });
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
