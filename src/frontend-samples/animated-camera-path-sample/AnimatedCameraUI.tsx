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
import AnimatedCameraApp, { AnimationSpeed, AttrValues, CameraPoint, PathDelay } from "./AnimatedCameraApp";
import { AnimatedCameraTool } from "./AnimatedCameraTool";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Point3d, Vector3d } from "@bentley/geometry-core";

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
    this.state = { attrValues: { isPause: false, sliderValue: 0, isUnlockDirectionOn: false, speedLevel: "Default", animationSpeed: AnimationSpeed.Default, pathDelay: PathDelay.Default }, PathArray: [] };
    this.handleCameraPlay = this.handleCameraPlay.bind(this);
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

  // Create the react component for the  slider
  private createCameraSlider(label: string) {
    const element = <input type={"range"} min={0} max={this.state.PathArray.length - 1} value={this.state.attrValues.sliderValue} style={{ marginLeft: "77px" }}
      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        if (this.state.vp) {
          const sliderValue: string = event.target.value;
          AnimatedCameraApp.isPaused = true;
          this.handleCameraPathAnimation();
          AnimatedCameraApp.countPathTravelled = Number(sliderValue) - 1;
          this.updateTimeline();
          AnimatedCameraApp.setViewFromPointAndDirection(this.state.PathArray, sliderValue, this.state.vp)
        }
      }
      } />;
    return this.createJSXElementForAttribute(label, element);
  }

  // Create the react component for the  Play button
  private handleCameraPlay() {
    if (undefined === this.state.vp)
      return;
    AnimatedCameraApp.animateCameraPlay(this.state.PathArray)
    this.handleCameraPathAnimation();
  }

  public async handleCameraPathAnimation() {
    if (undefined === this.state.vp)
      return;
    let pathCompleted: boolean = true;
    for (const cameraPoint of this.state.PathArray) {
      if (cameraPoint.isTraversed)
        continue;
      if (AnimatedCameraApp.isPaused) {
        pathCompleted = false;
        break;
      }
      await AnimatedCameraApp.animateCameraPath(cameraPoint, this.state.PathArray, this.state.attrValues.animationSpeed, this.state.attrValues.pathDelay, this.state.vp);
      this.updateTimeline();
    }
    if (pathCompleted) {
      AnimatedCameraApp.isInitialPositionStarted = false;
      AnimatedCameraApp.toolActivation();
    }
    this.updateTimeline();
  }

  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.vp)
      return;
    AnimatedCameraApp.isInitialPositionStarted = false;
    AnimatedCameraApp.isPaused = true;
    AnimatedCameraApp.countPathTravelled = 0;
    AnimatedCameraApp.isUnlockDirectionOn = false;
    const cameraPoints: CameraPoint[] = AnimatedCameraApp.loadCameraPath(event.target.value);
    (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(cameraPoints[0].point, cameraPoints[0].direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    this.state.vp.synchWithView();
    AnimatedCameraApp.toolActivation();
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, isPause: AnimatedCameraApp.isPaused, sliderValue: AnimatedCameraApp.countPathTravelled, isUnlockDirectionOn: AnimatedCameraApp.isUnlockDirectionOn }, PathArray: cameraPoints }));
  }

  // Create the react components for the render Path
  private _createRenderPath(label: string) {
    const options = { TrainPath: "Train Path", FlyoverPath: "Fly Over", CommuterPath: "Commuter View" }
    const element = <Select style={{ width: "fit-content", marginLeft: "34px" }} onChange={this._onChangeRenderPath} options={options} />;
    return this.createJSXElementForAttribute(label, element);
  }

  // Handle changes to the  Direction toggle.
  private _onChangeDirectionToggle = (checked: boolean) => {
    if (checked)
      AnimatedCameraApp.isUnlockDirectionOn = true;
    else
      AnimatedCameraApp.isUnlockDirectionOn = false;
  }

  // Create the react components for the camera toggle row.
  private _createDirectionToggle(label: string) {
    const element = <Toggle style={{ marginLeft: "30px" }} isOn={AnimatedCameraApp.isUnlockDirectionOn} onChange={(checked: boolean) => this._onChangeDirectionToggle(checked)} />;
    return this.createJSXElementForAttribute(label, element);
  }

  private _onChangeRenderSpeed = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const currentSpeed: string = event.target.value;
    let speedOfAnimation: number;
    let delay: number;
    switch (currentSpeed) {
      case "Slowest":
        speedOfAnimation = AnimationSpeed.Slowest;
        delay = PathDelay.Fastest;
        break;
      case "Slower":
        speedOfAnimation = AnimationSpeed.Slower;
        delay = PathDelay.Faster;
        break;
      case "Default":
        speedOfAnimation = AnimationSpeed.Default;
        delay = PathDelay.Default;
        break;
      case "Faster":
        speedOfAnimation = AnimationSpeed.Faster;
        delay = PathDelay.Slower;
        break;
      case "Fastest":
        speedOfAnimation = AnimationSpeed.Fastest;
        delay = PathDelay.Slowest;
        break;
    }
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, speedLevel: currentSpeed, animationSpeed: speedOfAnimation, pathDelay: delay } }));
  }
  //
  private createSpeedSlider(label: string) {
    const element = <Select style={{ width: "80px", marginLeft: "28px" }} onChange={this._onChangeRenderSpeed} options={["Slowest", "Slower", "Default", "Faster", "Fastest"]} value={this.state.attrValues.speedLevel} />
    return this.createJSXElementForAttribute(label, element);
  }

  public getControls(): React.ReactNode {
    return (
      <div>
        <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
          {this._createRenderPath("Path")}
        </div>
        <div className="sample-options-3col" style={{ maxWidth: "350px" }}>
          {this.createCameraSlider("Timeline")}
          <button style={{ width: "35px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={() => this.handleCameraPlay()} >{AnimatedCameraApp.isInitialPositionStarted ? AnimatedCameraApp.isPaused ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
        </div>
        <div>
          {this.createSpeedSlider("Animation Speed")}
        </div>
        <div>
          {this._createDirectionToggle("Unlock Direction")}
        </div>
      </div >
    );
  }

  public updateTimeline() {
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, isUnlockDirectionOn: AnimatedCameraApp.isUnlockDirectionOn, sliderValue: AnimatedCameraApp.countPathTravelled } }));
  }
  //
  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      AnimatedCameraApp.isInitialPositionStarted = false;
      AnimatedCameraApp.isPaused = false;
      AnimatedCameraApp.countPathTravelled = 0;
      const cameraPoints: CameraPoint[] = AnimatedCameraApp.loadCameraPath("TrainPath");
      this.setState({ vp, PathArray: cameraPoints });
      if (this.state.vp) {
        AnimatedCameraTool.viewport = vp;
        (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(new Point3d(cameraPoints[0].point.x, cameraPoints[0].point.y, cameraPoints[0].point.z), new Point3d(cameraPoints[0].direction.x, cameraPoints[0].direction.y, cameraPoints[0].direction.z), new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
        this.state.vp.synchWithView();
      }
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
        <ControlPane instructions="Use the timeline slider to drive the camera along the predefined path." controls={this.getControls()} ></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} isNavigationToolInvisible={AnimatedCameraApp.isInitialPositionStarted ? !AnimatedCameraApp.isPaused : false} />
      </>
    );
  }
}
