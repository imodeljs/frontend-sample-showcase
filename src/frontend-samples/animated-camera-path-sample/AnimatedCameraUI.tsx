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
import AnimatedCameraApp, { AnimationSpeed, CameraPoint, PathDelay } from "./AnimatedCameraApp";
import { AnimatedCameraTool } from "./AnimatedCameraTool";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Point3d, Vector3d } from "@bentley/geometry-core";

// cSpell:ignore imodels
/** The React state for this UI component */
interface AnimatedCameraAttributesState {
  vp?: Viewport;
  attrValues: {
    isPause: boolean;
    sliderValue: number;
    isUnlockDirectionOn: boolean;
    speedLevel: string;
    animationSpeed: number;
    pathDelay: number;
    isInitialPositionStarted: boolean;
  };
  PathArray: CameraPoint[];
}

/** A React component that renders the UI specific for this sample */
export default class AnimatedCameraUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, AnimatedCameraAttributesState> {
  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = { attrValues: { isPause: false, sliderValue: 0, isUnlockDirectionOn: false, speedLevel: "3 Mph: Walking", animationSpeed: AnimationSpeed.Default, pathDelay: PathDelay.Default, isInitialPositionStarted: false }, PathArray: [] };
    this._handleCameraPlay = this._handleCameraPlay.bind(this);
  }

  // This common function is used to create the react components for each row of the UI.
  private _createJSXElementForAttribute(label: string, element: JSX.Element) {
    return (
      <>
        <span style={{ marginLeft: "8px", marginRight: "0px" }}>{label}</span>
        {element}
      </>
    );
  }

  private _onChangeCameraSliderValue = (sliderNumber: number) => {
    let initialPositionStarted: boolean = true;
    if (sliderNumber === this.state.PathArray.length - 1)
      initialPositionStarted = false;
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: sliderNumber, isInitialPositionStarted: initialPositionStarted } }), () => {
      if (this.state.vp)
        AnimatedCameraApp.setViewFromPointAndDirection(this.state.PathArray, this.state.attrValues.sliderValue, this.state.vp)
      AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted, this.state.attrValues.isPause);
    });
  }

  // Create the react component for the  slider
  private _createCameraSlider(label: string) {
    const element = <input type={"range"} min={0} max={this.state.PathArray.length - 1} value={this.state.attrValues.sliderValue} style={{ marginLeft: "77px" }}
      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        const sliderNumber: number = Number(event.target.value);
        if (this.state.attrValues.isPause)
          this._onChangeCameraSliderValue(sliderNumber);
        else {
          this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isPause: true } }), () => setTimeout(() => this._onChangeCameraSliderValue(sliderNumber), 40));
        }
      }
      } />;
    return this._createJSXElementForAttribute(label, element);
  }

  // Update the States for the Play/Pause button click event
  private _handleCameraPlay() {
    if (this.state.vp === undefined)
      return;
    let timelineValue: number;
    let isCameraPaused: boolean;
    if (!this.state.attrValues.isInitialPositionStarted) {
      for (const coordinate of this.state.PathArray) {
        coordinate.isTraversed = false;
      }
      timelineValue = 0;
      isCameraPaused = false;
    } else {
      timelineValue = this.state.attrValues.sliderValue;
      isCameraPaused = !this.state.attrValues.isPause;
    }
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: true, sliderValue: timelineValue, isPause: isCameraPaused } }), () => {
      AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted, this.state.attrValues.isPause);
      this._handleCameraPathAnimation();
    });
  }

  // Handle the Camera Animation
  private async _handleCameraPathAnimation() {
    if (this.state.vp === undefined)
      return;
    let pathCompleted: boolean = true;
    let pathCompletedCount: number = 0;
    for (const cameraPoint of this.state.PathArray) {
      if (cameraPoint.isTraversed)
        continue;
      if (this.state.attrValues.isPause) {
        pathCompleted = false;
        break;
      }
      pathCompletedCount = await AnimatedCameraApp.animateCameraPath(cameraPoint, this.state.PathArray, this.state.attrValues.animationSpeed, this.state.attrValues.pathDelay, this.state.attrValues.isUnlockDirectionOn, this.state.attrValues.sliderValue, this.state.vp);
      cameraPoint.isTraversed = true;
      this._updateTimeline(pathCompletedCount);
    }
    if (pathCompleted) {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: false } }), () => AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted, this.state.attrValues.isPause));
    }
  }

  // Handle the Path Change
  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cameraPoints: CameraPoint[] = AnimatedCameraApp.loadCameraPath(event.target.value);
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isPause: true, isInitialPositionStarted: false, isUnlockDirectionOn: false }, PathArray: cameraPoints }), () => {
      setTimeout(() => {
        AnimatedCameraTool.isUnlockDirectionOn = false;
        if (this.state.vp) {
          (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(this.state.PathArray[0].point, this.state.PathArray[0].direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
          this.state.vp.synchWithView();
          this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: 0 } }));
        }
        AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted, this.state.attrValues.isPause);
      }, 40);
    });
  }

  // Create the react components for the  Paths
  private _createRenderPath(label: string) {
    const options = { TrainPath: "Train Path", FlyoverPath: "Fly Over", CommuterPath: "Commuter View" }
    const element = <Select style={{ width: "fit-content", marginLeft: "34px" }} onChange={this._onChangeRenderPath} options={options} />;
    return this._createJSXElementForAttribute(label, element);
  }

  // Handle changes to the  Direction toggle.
  private _onChangeDirectionToggle = (checked: boolean) => {
    let unlockDirectionFlag: boolean;
    if (checked)
      unlockDirectionFlag = true;
    else
      unlockDirectionFlag = false;
    AnimatedCameraTool.isUnlockDirectionOn = unlockDirectionFlag;
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isUnlockDirectionOn: unlockDirectionFlag } }));
  }

  // Create the react components for the camera Direction toggle
  private _createDirectionToggle(label: string) {
    const element = <Toggle style={{ marginLeft: "30px" }} isOn={this.state.attrValues.isUnlockDirectionOn} onChange={(checked: boolean) => this._onChangeDirectionToggle(checked)} />;
    return this._createJSXElementForAttribute(label, element);
  }

  // Handle the speed level change
  private _onChangeRenderSpeed = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const currentSpeed: string = event.target.value;
    let speedOfAnimation: number;
    let delay: number;
    switch (currentSpeed) {
      case "1 Mph: Slow Walk":
        speedOfAnimation = AnimationSpeed.Default;
        delay = PathDelay.Slowest;
        break;
      case "3 Mph: Walking":
        speedOfAnimation = AnimationSpeed.Default;
        delay = PathDelay.Default;
        break;
      case "30 Mph: Car":
        speedOfAnimation = AnimationSpeed.Fast;
        delay = PathDelay.Fast;
        break;
      case "60 Mph: Fast Car":
        speedOfAnimation = AnimationSpeed.Faster;
        delay = PathDelay.Faster;
        break;
      case "150 Mph: Airplane":
        speedOfAnimation = AnimationSpeed.Fastest;
        delay = PathDelay.Fastest;
        break;
    }
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, speedLevel: currentSpeed, animationSpeed: speedOfAnimation, pathDelay: delay } }));
  }

  // Create the react component for the camera speed dropdown
  private _createSpeedDropDown(label: string) {
    const element = <Select style={{ width: "140px", marginLeft: "28px" }} onChange={this._onChangeRenderSpeed} options={["1 Mph: Slow Walk", "3 Mph: Walking", "30 Mph: Car", "60 Mph: Fast Car", "150 Mph: Airplane"]} value={this.state.attrValues.speedLevel} />
    return this._createJSXElementForAttribute(label, element);
  }

  public getControls(): React.ReactNode {
    return (
      <div>
        <div className="sample-options-2col" style={{ maxWidth: "350px" }}>
          {this._createRenderPath("Path")}
        </div>
        <div className="sample-options-3col" style={{ maxWidth: "350px" }}>
          {this._createCameraSlider("Timeline")}
          <button style={{ width: "35px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={() => this._handleCameraPlay()} >{this.state.attrValues.isInitialPositionStarted ? this.state.attrValues.isPause ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
        </div>
        <div>
          {this._createSpeedDropDown("Animation Speed")}
        </div>
        <div>
          {this._createDirectionToggle("Unlock Direction")}
        </div>
      </div >
    );
  }

  // Update the Slider timeline continuously while animation is active
  private _updateTimeline(pathCountCompleted: number) {
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: pathCountCompleted } }));
  }

  public onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      const cameraPoints: CameraPoint[] = AnimatedCameraApp.loadCameraPath("TrainPath");
      this.setState({ vp, PathArray: cameraPoints }, () => {
        if (this.state.vp) {
          AnimatedCameraTool.viewport = vp;
          (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(new Point3d(cameraPoints[0].point.x, cameraPoints[0].point.y, cameraPoints[0].point.z), new Point3d(cameraPoints[0].direction.x, cameraPoints[0].direction.y, cameraPoints[0].direction.z), new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
          this.state.vp.synchWithView();
        }
      });
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
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} isNavigationToolInvisible={this.state.attrValues.isInitialPositionStarted ? !this.state.attrValues.isPause : false} />
      </>
    );
  }
}
