/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, IModelConnection, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Select } from "@bentley/ui-core";
import { RenderMode } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import CameraPathApp, { AnimationSpeed, CameraPoint, PathDelay } from "./CameraPathApp";
import { CameraPathTool } from "./CameraPathTool";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";

// cSpell:ignore imodels
/** The React state for this UI component */
interface CameraPathUIAttributeState {
  vp?: Viewport;
  attrValues: {
    isPause: boolean;
    sliderValue: number;
    speedLevel: string;
    animationSpeed: number;
    pathDelay: number;
    isInitialPositionStarted: boolean;
  };
  PathArray: CameraPoint[];
}

/** A React component that renders the UI specific for this sample */
export default class CameraPathUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, CameraPathUIAttributeState> {
  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = { attrValues: { isPause: false, sliderValue: 0, speedLevel: "3 Mph: Walking", animationSpeed: AnimationSpeed.Default, pathDelay: PathDelay.Default, isInitialPositionStarted: false }, PathArray: [] };
    this._handleCameraPlay = this._handleCameraPlay.bind(this);
  }

  // This common function is used to create the react components for each row of the UI.
  private _createJSXElementForAttribute(label: string, element: JSX.Element) {
    return (
      <>
        <span style={{ marginLeft: "6px", marginRight: "0px" }}>{label}</span>
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
        CameraPathApp.setViewFromPointAndDirection(this.state.PathArray[this.state.attrValues.sliderValue], this.state.vp);
    });
  }

  // Create the react component for the  slider
  private _createCameraSlider(label: string) {
    const element = <input type={"range"} min={0} max={this.state.PathArray.length - 1} value={this.state.attrValues.sliderValue} style={{ marginLeft: "10px", width: "150px" }}
      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        const sliderNumber: number = Number(event.target.value);

        if (this.state.attrValues.isPause) {
          if (CameraPathTool.isMouseWheelAnimationActive) {
            CameraPathTool.isMouseWheelAnimationActive = false;
            setTimeout(() => this._onChangeCameraSliderValue(sliderNumber), 40);
          } else
            this._onChangeCameraSliderValue(sliderNumber);
        } else {
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
      timelineValue = 0;
      isCameraPaused = false;
    } else {
      timelineValue = this.state.attrValues.sliderValue;
      isCameraPaused = !this.state.attrValues.isPause;
    }
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: true, sliderValue: timelineValue, isPause: isCameraPaused } }), () => {
      this._handleCameraPathAnimation();
    });
  }

  // Handle the Camera Animation
  private async _handleCameraPathAnimation() {
    if (this.state.vp === undefined)
      return;
    let pathCompleted: boolean = true;
    let pathCompletedCount: number = 0;
    CameraPathTool.isMouseWheelAnimationActive = false;
    for (let i: number = this.state.attrValues.sliderValue + 1; i <= this.state.PathArray.length - 1; i++) {
      if (this.state.attrValues.isPause) {
        pathCompleted = false;
        break;
      }
      pathCompletedCount = await CameraPathApp.animateCameraPath(this.state.PathArray[i], i, this.state.attrValues.animationSpeed, this.state.attrValues.pathDelay, this.state.attrValues.sliderValue, this.state.vp);
      this._updateTimeline(pathCompletedCount);
    }
    if (pathCompleted) {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: false } })); // () => AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted, this.state.attrValues.isPause));
    }
  }

  // Handle the Path Change
  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cameraPoints: CameraPoint[] = CameraPathApp.loadCameraPath(event.target.value, 1.4); // The normal human walking Speed is 1.4 meters/second
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isPause: true, isInitialPositionStarted: false, isUnlockDirectionOn: false }, PathArray: cameraPoints }), () => {
      setTimeout(() => {
        if (this.state.vp) {
          CameraPathApp.setViewFromPointAndDirection(this.state.PathArray[0], this.state.vp);
          CameraPathTool.isMouseWheelAnimationActive = false;
          this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: 0 } }));
        }
      }, 40);
    });
  }

  // Create the react components for the  Paths
  private _createRenderPath(label: string) {
    const options = { TrainPath: "Train Path", FlyoverPath: "Fly Over", CommuterPath: "Commuter View" }
    const element = <Select style={{ width: "fit-content", marginLeft: "12px" }} onChange={this._onChangeRenderPath} options={options} />;
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
    const element = <Select style={{ width: "140px", marginLeft: "48px" }} onChange={this._onChangeRenderSpeed} options={["1 Mph: Slow Walk", "3 Mph: Walking", "30 Mph: Car", "60 Mph: Fast Car", "150 Mph: Airplane"]} value={this.state.attrValues.speedLevel} />
    return this._createJSXElementForAttribute(label, element);
  }

  public getControls(): React.ReactNode {
    return (
      <div>
        <div className="sample-options-2col" style={{ maxWidth: "310px" }}>
          {this._createRenderPath("Path")}
        </div>
        <div className="sample-options-2col" style={{ maxWidth: "310px" }}>
          {this._createCameraSlider("Progress Bar")}
        </div>
        <div className="sample-options-3col" style={{ maxWidth: "310px" }}>
          {this._createSpeedDropDown("Animate")}
          <button style={{ width: "35px", marginLeft: "4px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={() => this._handleCameraPlay()} >{this.state.attrValues.isInitialPositionStarted ? this.state.attrValues.isPause ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
        </div>
      </div >
    );
  }

  public componentWillUnmount() {
    document.getElementById("sample-container")?.removeEventListener("wheel", this._handleScrollAnimation);
  }

  // Update the Slider timeline continuously while animation is active
  private _updateTimeline(pathCountCompleted: number) {
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: pathCountCompleted } }));
  }

  public onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      document.getElementById("sample-container")?.addEventListener("wheel", this._handleScrollAnimation);
      const cameraPoints: CameraPoint[] = CameraPathApp.loadCameraPath("TrainPath", 1.4); // The normal human walking Speed is 1.4 meters/second
      this.setState({ vp, PathArray: cameraPoints }, () => {
        if (this.state.vp) {
          CameraPathTool.viewport = vp;
          CameraPathApp.toolActivation();
          CameraPathApp.setViewFromPointAndDirection(this.state.PathArray[0], this.state.vp);
        }
      });
    });
  }

  private async _handleScrollPath(eventDeltaY: number) {
    if (this.state.vp === undefined)
      return;
    let initialPositionStarted: boolean = true;
    CameraPathTool.isMouseWheelAnimationActive = true;
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: initialPositionStarted } }));
    let pathCompletedCount: number = 0;
    const sliderValue = this.state.attrValues.sliderValue;
    let cameraPathIterationValue: number;
    if (eventDeltaY < 0) {
      cameraPathIterationValue = sliderValue + (this.state.PathArray.length / 50);  // Increase the path motion distance from current coordinate to (length of path)/50
      if (cameraPathIterationValue > this.state.PathArray.length - 1)
        cameraPathIterationValue = this.state.PathArray.length - 1;
      for (let i: number = sliderValue + 1; i <= cameraPathIterationValue; i++) {
        if (!CameraPathTool.isMouseWheelAnimationActive)
          break;
        pathCompletedCount = await CameraPathApp.animateCameraPath(this.state.PathArray[i], i, this.state.attrValues.animationSpeed, PathDelay.Fastest, this.state.attrValues.sliderValue, this.state.vp);
        this._updateTimeline(pathCompletedCount);
      }
    } else if (eventDeltaY > 0) {
      cameraPathIterationValue = sliderValue - (this.state.PathArray.length / 50); // Decrease the path motion distance from current coordinate to (length of path)/50
      if (cameraPathIterationValue < 0)
        cameraPathIterationValue = 0;
      for (let i: number = sliderValue; i >= cameraPathIterationValue; i--) {
        if (!CameraPathTool.isMouseWheelAnimationActive)
          break;
        pathCompletedCount = this.state.attrValues.sliderValue - 1
        await CameraPathApp.animateCameraPath(this.state.PathArray[i], i, this.state.attrValues.animationSpeed, PathDelay.Fastest, this.state.attrValues.sliderValue, this.state.vp);
        this._updateTimeline(pathCompletedCount);
      }
    }
    CameraPathTool.isMouseWheelEventActive = false;
    if (this.state.attrValues.sliderValue === this.state.PathArray.length - 1) {
      initialPositionStarted = false;
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: initialPositionStarted } }));
    }
  }

  private _handleScrollAnimation = (event: WheelEvent) => {
    if (CameraPathTool.isMouseWheelEventActive) {
      return;
    }
    CameraPathTool.isMouseWheelEventActive = true;
    if (this.state.attrValues.isPause) {
      this._handleScrollPath(event.deltaY);
    } else {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isPause: true } }), () => setTimeout(async () => this._handleScrollPath(event.deltaY), 40));
    }
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
        <ControlPane instructions="Use the mouse wheel to scroll the camera along the predefined path. Click in the view to look around." controls={this.getControls()} ></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} isNavigationToolInvisible={true} />
      </>
    );
  }
}
