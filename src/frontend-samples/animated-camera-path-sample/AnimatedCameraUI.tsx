/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, IModelConnection, Viewport, ViewState, ViewState3d } from "@bentley/imodeljs-frontend";
import { Input, Select, Toggle } from "@bentley/ui-core";
import { RenderMode } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import AnimatedCameraApp, { AttrValues, CameraPoint } from "./AnimatedCameraApp";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Point3d, Vector3d } from "@bentley/geometry-core";
import { commuterViewCoordinates, flyoverCoordinates, trainPathCoordinates } from "./Coordinates";
import { AnimatedCameraTool } from "./AnimatedCameraTool";
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
        isPause: false,
        sliderValue: 0,
        isUnlockDirectionOn: false,
        speed: "Default",
      }, PathArray: [],
    };
    this.animateCameraPlay = this.animateCameraPlay.bind(this);
  }

  // This common function is used to create the react components for each row of the UI.
  private createJSXElementForAttribute(label: string, element: JSX.Element) {
    return (
      <>
        <span style={{ marginLeft: "8px", marginRight: "0px" }}>{label}</span>
        {element}
      </>
    );
  }

  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.vp)
      return;
    AnimatedCameraApp.isInitialPositionStarted = false;
    AnimatedCameraApp.isPaused = true;
    AnimatedCameraApp.countPathTravelled = 0;
    AnimatedCameraApp.isUnlockDirectionOn = false;
    (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(this.state.PathArray[0].Point, this.state.PathArray[0].Direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    this.state.vp.synchWithView();
    if (this.state.vp)
      (this.state.vp.view as ViewState3d).setupFromFrustum(AnimatedCameraApp.initialFrustum);
    const cameraPoints: CameraPoint[] = [];
    switch (event.target.value) {
      case "Path1":
        trainPathCoordinates.forEach((item, index) => {
          if (index !== trainPathCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.00015) {
              cameraPoints.push({ Point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].cameraPoint.x, trainPathCoordinates[index + 1].cameraPoint.y, trainPathCoordinates[index + 1].cameraPoint.z)), Direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].viewDirection.x, trainPathCoordinates[index + 1].viewDirection.y, trainPathCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;

      case "Path2":
        flyoverCoordinates.forEach((item, index) => {
          if (index !== flyoverCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.0002) {
              cameraPoints.push({ Point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(flyoverCoordinates[index + 1].cameraPoint.x, flyoverCoordinates[index + 1].cameraPoint.y, flyoverCoordinates[index + 1].cameraPoint.z)), Direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(flyoverCoordinates[index + 1].viewDirection.x, flyoverCoordinates[index + 1].viewDirection.y, flyoverCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;

      case "Path3":
        commuterViewCoordinates.forEach((item, index) => {
          if (index !== commuterViewCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.0025) {
              cameraPoints.push({ Point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(commuterViewCoordinates[index + 1].cameraPoint.x, commuterViewCoordinates[index + 1].cameraPoint.y, commuterViewCoordinates[index + 1].cameraPoint.z)), Direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(commuterViewCoordinates[index + 1].viewDirection.x, commuterViewCoordinates[index + 1].viewDirection.y, commuterViewCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;
    }
    (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(cameraPoints[0].Point, cameraPoints[0].Direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    this.state.vp.synchWithView();
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, isPause: AnimatedCameraApp.isPaused, sliderValue: AnimatedCameraApp.countPathTravelled, isUnlockDirectionOn: AnimatedCameraApp.isUnlockDirectionOn }, PathArray: cameraPoints }));

    if (this.state.vp) {
      AnimatedCameraApp.currentFrustum = this.state.vp.getFrustum().clone();
      AnimatedCameraApp.initialFrustum = this.state.vp.getFrustum().clone();
    }
  }


  // Create the react components for the render Path
  private createRenderPath(label: string) {
    const options = {
      Path1: "Train Path",
      Path2: "Fly Over",
      Path3: "Commuter View",
    }
    const element = <Select style={{ width: "fit-content", marginLeft: "34px" }} onChange={this._onChangeRenderPath} options={options} />;
    return this.createJSXElementForAttribute(label, element);
  }

  // Create the react component for the  slider
  private createCameraSlider(label: string) {
    const element = <input type={"range"} min={0} max={this.state.PathArray.length - 1} value={this.state.attrValues.sliderValue} style={{ marginLeft: "77px" }}
      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (this.state.vp) {
          const sliderValue: string = event.target.value;
          AnimatedCameraApp.isPaused = true;
          this.animateCameraPath();
          (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(this.state.PathArray[0].Point, this.state.PathArray[0].Direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
          this.state.vp.synchWithView();
          AnimatedCameraApp.countPathTravelled = Number(sliderValue) - 1;
          AnimatedCameraApp.isInitialPositionStarted = true;
          this.updateTimeline();
          if (this.state.vp)
            (this.state.vp.view as ViewState3d).setupFromFrustum(AnimatedCameraApp.initialFrustum);
          for (const coOrdinate of this.state.PathArray) {
            if (this.state.PathArray.indexOf(coOrdinate) <= Number(sliderValue)) {
              if (this.state.PathArray.indexOf(coOrdinate) % 5 === 0 || this.state.PathArray.indexOf(coOrdinate) === Number(sliderValue)) {
                (this.state.vp?.view as ViewState3d).lookAtUsingLensAngle(coOrdinate.Point, coOrdinate.Direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
                this.state.vp?.synchWithView();
                AnimatedCameraApp.currentFrustum = this.state.vp?.getFrustum().clone();
              }
              coOrdinate.isTraversed = true;
            }
            else
              coOrdinate.isTraversed = false;
          }
        }
      }
      } />;
    return this.createJSXElementForAttribute(label, element);
  }

  // Create the react component for the  Play button
  private async animateCameraPlay() {
    if (undefined === this.state.vp)
      return;
    if (!AnimatedCameraApp.isInitialPositionStarted) {
      for (const coOrdinate of this.state.PathArray) {
        coOrdinate.isTraversed = false;
      }
      AnimatedCameraApp.countPathTravelled = 0;
      AnimatedCameraApp.isInitialPositionStarted = true;
      AnimatedCameraApp.isPaused = false;
    }
    else {
      AnimatedCameraApp.isPaused = !AnimatedCameraApp.isPaused;
      if (!AnimatedCameraApp.isPaused) {
        (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(this.state.PathArray[0].Point, this.state.PathArray[0].Direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
        this.state.vp.synchWithView();
        if (this.state.vp)
          (this.state.vp.view as ViewState3d).setupFromFrustum(AnimatedCameraApp.initialFrustum);
        for (const coOrdinate of this.state.PathArray) {
          if (coOrdinate.isTraversed) {
            (this.state.vp?.view as ViewState3d).lookAtUsingLensAngle(coOrdinate.Point, coOrdinate.Direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
            this.state.vp?.synchWithView();
            AnimatedCameraApp.currentFrustum = this.state.vp?.getFrustum().clone();
          }
          else
            break;
        }
      }
    }
    this.animateCameraPath();
  }

  public async animateCameraPath() {
    let pathCompleted: boolean = true;
    for (const cameraPoint of this.state.PathArray) {
      if (cameraPoint.isTraversed)
        continue;
      if (AnimatedCameraApp.isPaused) {
        pathCompleted = false;
        break;
      }
      if (this.state.PathArray.indexOf(cameraPoint) % AnimatedCameraApp.animationSpeed === 0) {
        if (!AnimatedCameraApp.isUnlockDirectionOn)
          (this.state.vp?.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.Point, cameraPoint.Direction, new Vector3d(0, 0, 1), (this.state.vp?.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
        else
          (this.state.vp?.view as ViewState3d).setEyePoint(cameraPoint.Point);
        this.state.vp?.synchWithView();
        await AnimatedCameraApp.delay(AnimatedCameraApp.pathDelay);
      }
      if (this.state.vp)
        AnimatedCameraApp.currentFrustum = this.state.vp?.getFrustum().clone();
      cameraPoint.isTraversed = true;
      AnimatedCameraApp.countPathTravelled++;
      this.updateTimeline();
    }
    if (pathCompleted) {
      AnimatedCameraApp.isInitialPositionStarted = false;
    }
    this.updateTimeline();
  }

  // Handle changes to the  Direction toggle.
  private _onChangeDirectionToggle = (checked: boolean) => {
    if (undefined === this.state.vp)
      return;
    IModelApp.tools.run(AnimatedCameraTool.toolId);
    if (checked)
      AnimatedCameraApp.isUnlockDirectionOn = true;
    else
      AnimatedCameraApp.isUnlockDirectionOn = false;
  }

  // Create the react components for the camera toggle row.
  private createDirectionToggle(label: string) {
    const element = <Toggle style={{ marginLeft: "30px" }} isOn={AnimatedCameraApp.isUnlockDirectionOn} onChange={(checked: boolean) => this._onChangeDirectionToggle(checked)} />;
    return this.createJSXElementForAttribute(label, element);
  }

  private _onChangeRenderSpeed = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.vp)
      return;
    const currentSpeed: string = event.target.value;
    switch (event.target.value) {
      case "Slowest":
        AnimatedCameraApp.animationSpeed = 1;
        AnimatedCameraApp.pathDelay = 40;
        break;
      case "Slower":
        AnimatedCameraApp.animationSpeed = 2;
        AnimatedCameraApp.pathDelay = 30;
        break;
      case "Default":
        AnimatedCameraApp.animationSpeed = 3;
        AnimatedCameraApp.pathDelay = 20;
        break;
      case "Faster":
        AnimatedCameraApp.animationSpeed = 4;
        AnimatedCameraApp.pathDelay = 10;
        break;
      case "Fastest":
        AnimatedCameraApp.animationSpeed = 5;
        AnimatedCameraApp.pathDelay = 1;
        break;
    }
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, speed: currentSpeed } }));
  }
  //
  private createSpeedSlider(label: string) {
    const element = <Select style={{ width: "80px", marginLeft: "28px" }} onChange={this._onChangeRenderSpeed} options={["Slowest", "Slower", "Default", "Faster", "Fastest"]} value={this.state.attrValues.speed} />
    return this.createJSXElementForAttribute(label, element);
  }


  public updateTimeline() {
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, isUnlockDirectionOn: AnimatedCameraApp.isUnlockDirectionOn, sliderValue: AnimatedCameraApp.countPathTravelled } }));
  }
  public getControls(): React.ReactNode {
    return (
      <div>
        <div style={{ maxWidth: "350px" }}>
          <div className="sample-options-2col" style={{ maxWidth: "350px" }}><span style={{ marginLeft: "8px" }}>imodel</span>
            <Input value="Metrostation Sample" style={{ marginLeft: "33px", width: "151px", color: "white" }} disabled />
          </div>
          <hr style={{ width: "346px", color: "white", marginLeft: "1px" }}></hr>
        </div>
        <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
          {this.createRenderPath("Path")}
        </div>
        <div className="sample-options-3col" style={{ maxWidth: "350px" }}>
          {this.createCameraSlider("Timeline")}
          <button style={{ width: "35px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={this.animateCameraPlay} >{AnimatedCameraApp.isInitialPositionStarted ? AnimatedCameraApp.isPaused ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
        </div>
        <div>
          {this.createSpeedSlider("Animation Speed")}
        </div>
        <div>
          {this.createDirectionToggle("Unlock Direction")}
        </div>
      </div >
    );
  }

  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      AnimatedCameraApp.isInitialPositionStarted = false;
      AnimatedCameraApp.isPaused = false;
      AnimatedCameraApp.countPathTravelled = 0;
      AnimatedCameraApp.animationSpeed = 3;
      AnimatedCameraApp.pathDelay = 20;
      const cameraPoints: CameraPoint[] = [];
      trainPathCoordinates.forEach((item, index) => {
        if (index !== trainPathCoordinates.length - 1) {
          for (let j: number = 0.00; j <= 1.0; j = j + 0.00015) {
            cameraPoints.push({ Point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].cameraPoint.x, trainPathCoordinates[index + 1].cameraPoint.y, trainPathCoordinates[index + 1].cameraPoint.z)), Direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].viewDirection.x, trainPathCoordinates[index + 1].viewDirection.y, trainPathCoordinates[index + 1].viewDirection.z)), isTraversed: false });
          }
        }
      });
      this.setState({ vp, PathArray: cameraPoints });
      if (this.state.vp) {
        AnimatedCameraApp.viewport = this.state.vp;
        (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(new Point3d(trainPathCoordinates[0].cameraPoint.x, trainPathCoordinates[0].cameraPoint.y, trainPathCoordinates[0].cameraPoint.z), new Point3d(trainPathCoordinates[0].viewDirection.x, trainPathCoordinates[0].viewDirection.y, trainPathCoordinates[0].viewDirection.z), new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
        this.state.vp.synchWithView();
        AnimatedCameraApp.currentFrustum = this.state.vp.getFrustum().clone();
        AnimatedCameraApp.initialFrustum = this.state.vp.getFrustum().clone();
      }
    });
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    document.getElementById("root")?.addEventListener("click", this.m8);
    const viewState = await ViewSetup.getDefaultView(imodel);
    viewState.viewFlags.renderMode = RenderMode.SmoothShade;
    return viewState;
  }

  /** The sample's render method */
  public render() {
    IModelApp.tools.run(AnimatedCameraTool.toolId);
    return (
      <>
        <ControlPane instructions="Use the timeline slider to drive the camera along the predefined path." controls={this.getControls()} ></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} isIdleToolInvisible={AnimatedCameraApp.isInitialPositionStarted ? !AnimatedCameraApp.isPaused : false} />
      </>
    );
  }
}
