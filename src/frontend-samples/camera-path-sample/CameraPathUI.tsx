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
import CameraPathApp, { CameraPath } from "./CameraPathApp";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { CameraPathTool } from "./CameraPathTool";

// cSpell:ignore imodels
/** The React state for this UI component */
interface CameraPathUIAttributeState {
  vp?: Viewport;
  attrValues: {
    isPause: boolean;
    sliderValue: number;
    speedLevel: string;
    currentSpeed: number;
    isInitialPositionStarted: boolean;
    isMouseWheelAnimationActive: boolean;
    keyDown: boolean;
  };
  cameraPath: CameraPath;
}

/** A React component that renders the UI specific for this sample */
export default class CameraPathUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, CameraPathUIAttributeState> {
  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = { attrValues: { isPause: false, sliderValue: 0, speedLevel: "3 Mph: Walking", currentSpeed: 0, isInitialPositionStarted: false, isMouseWheelAnimationActive: false, keyDown: false }, cameraPath: CameraPath.createByLoadingFromJson("TrainPath") };
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
    if (sliderNumber === 1)
      initialPositionStarted = false;
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: sliderNumber, isInitialPositionStarted: initialPositionStarted } }), () => {
      if (this.state.vp) {
        const nextPointAndDirectionFromPathFraction = this.state.cameraPath.getPointAndDirection(this.state.attrValues.sliderValue);
        CameraPathApp.setViewFromPointAndDirection(nextPointAndDirectionFromPathFraction, this.state.vp);
      }
    });
  }

  // Create the react component for the  slider
  private _createCameraSlider(label: string) {
    const element = <input type={"range"} min={0.0} max={1.0} value={this.state.attrValues.sliderValue} style={{ marginLeft: "10px", width: "150px" }} step={Math.pow(10, -10)}
      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        const sliderNumber: number = Number(event.target.value);
        if (this.state.attrValues.isPause) {
          if (this.state.attrValues.isMouseWheelAnimationActive) {
            this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isMouseWheelAnimationActive: false } }), () => setTimeout(() => this._onChangeCameraSliderValue(sliderNumber), 40));
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
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: true, sliderValue: timelineValue, isPause: isCameraPaused, isMouseWheelAnimationActive: false } }), () => {
      this._handleCameraPathAnimation();
    });
  }

  // Handle the Camera Animation
  private async _handleCameraPathAnimation() {
    if (this.state.vp === undefined)
      return;
    let pathCompleted: boolean = true;
    while (this.state.attrValues.sliderValue < 1) {
      if (this.state.attrValues.isPause) {
        pathCompleted = false;
        break;
      }
      const nextPathFraction = this.state.cameraPath.advanceAlongPath(this.state.attrValues.sliderValue, this.state.attrValues.currentSpeed / 30);
      const nextPointAndDirectionFromPathFraction = this.state.cameraPath.getPointAndDirection(nextPathFraction);
      await CameraPathApp.animateCameraPath(nextPointAndDirectionFromPathFraction, this.state.vp, this.state.attrValues.keyDown);
      this._updateTimeline(nextPathFraction);
    }
    if (pathCompleted) {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: false } }));
    }
  }

  // Handle the Path Change
  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cameraPath = CameraPath.createByLoadingFromJson(event.target.value);
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isPause: true, isMouseWheelAnimationActive: false, isInitialPositionStarted: false, isUnlockDirectionOn: false }, cameraPath }), () => {
      setTimeout(() => {
        if (this.state.vp) {
          const nextPointAndDirectionFromPathFraction = this.state.cameraPath.getPointAndDirection(0);
          CameraPathApp.setViewFromPointAndDirection(nextPointAndDirectionFromPathFraction, this.state.vp);
          this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: 0 } }));
        }
      }, 40);
    });
  }

  // Create the react components for the  Paths
  private _createRenderPath(label: string) {
    const options = { TrainPath: "Train Path", FlyoverPath: "Fly Over", CommuterPath: "Commuter View" };
    const element = <Select style={{ width: "fit-content", marginLeft: "12px" }} onChange={this._onChangeRenderPath} options={options} />;
    return this._createJSXElementForAttribute(label, element);
  }

  // Handle the speed level change
  private _onChangeRenderSpeed = (currentSpeed: string) => {
    let speedOfMotion: number = 0;
    switch (currentSpeed) {
      case "1 Mph: Slow Walk":
        speedOfMotion = 0.4; // 1Mph = 0.4 meters/second
        break;
      case "3 Mph: Walking":
        speedOfMotion = 1.4; // 3Mph = 1.4 meters/second
        break;
      case "30 Mph: Car":
        speedOfMotion = 13.4; // 30Mph = 13.4 meters/second
        break;
      case "60 Mph: Fast Car":
        speedOfMotion = 46.8; // 60Mph = 26.8 meters/second
        break;
      case "150 Mph: Airplane":
        speedOfMotion = 67.05; // 150Mph = 67.05 meters/second
        break;
    }
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, currentSpeed: speedOfMotion, speedLevel: currentSpeed } }));
  }

  // Create the react component for the camera speed dropdown
  private _createSpeedDropDown(label: string) {
    const element = <Select style={{ width: "140px", marginLeft: "48px" }} options={["1 Mph: Slow Walk", "3 Mph: Walking", "30 Mph: Car", "60 Mph: Fast Car", "150 Mph: Airplane"]} value={this.state.attrValues.speedLevel} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this._onChangeRenderSpeed(event.target.value)} />;
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

  // Update the Slider timeline continuously while animation is active
  private _updateTimeline(pathFractionCompleted: number) {
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: pathFractionCompleted } }));
  }

  public onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      this._onChangeRenderSpeed(this.state.attrValues.speedLevel);
      this.setState({ vp }, () => {
        if (this.state.vp) {
          this.toolActivation();
          const nextPointAndDirectionFromPathFraction = this.state.cameraPath.getPointAndDirection(0);
          CameraPathApp.setViewFromPointAndDirection(nextPointAndDirectionFromPathFraction, this.state.vp);
        }
      });
    });
  }

  // We will use this method to activate the CameraPathTool
  // The CameraPathTool will prevent the view tool and standard mouse events
  private toolActivation() {
    IModelApp.tools.run(CameraPathTool.toolId, this.handleScrollAnimation, this.handleUnlockDirection);
  }

  private _handleScrollPath(eventDeltaY: number) {
    let initialPositionStarted: boolean = true;
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isMouseWheelAnimationActive: true, isInitialPositionStarted: initialPositionStarted } }), async () => {
      if (this.state.vp === undefined)
        return;
      const stepLength = (this.state.cameraPath.getLength() / 10) / 30;
      const sliderValue = this.state.attrValues.sliderValue;
      let cameraPathIterationValue: number;
      if (eventDeltaY > 0) {
        cameraPathIterationValue = sliderValue + 0.009;
        if (cameraPathIterationValue > 1)
          cameraPathIterationValue = 1;
        while (this.state.attrValues.sliderValue <= cameraPathIterationValue) {
          if (!this.state.attrValues.isMouseWheelAnimationActive) {
            break;
          }
          const nextPathFraction = this.state.cameraPath.advanceAlongPath(this.state.attrValues.sliderValue, stepLength);
          const nextPointAndDirectionFromPathFraction = this.state.cameraPath.getPointAndDirection(nextPathFraction);
          await CameraPathApp.animateCameraPath(nextPointAndDirectionFromPathFraction, this.state.vp, this.state.attrValues.keyDown);
          this._updateTimeline(nextPathFraction);
        }
      } else if (eventDeltaY < 0) {
        cameraPathIterationValue = sliderValue - 0.009;
        if (cameraPathIterationValue < 0)
          cameraPathIterationValue = 0;
        while (this.state.attrValues.sliderValue >= cameraPathIterationValue) {
          if (!this.state.attrValues.isMouseWheelAnimationActive)
            break;
          const nextPathFraction = this.state.cameraPath.advanceAlongPath(this.state.attrValues.sliderValue, - stepLength);
          const nextPointAndDirectionFromPathFraction = this.state.cameraPath.getPointAndDirection(nextPathFraction);
          await CameraPathApp.animateCameraPath(nextPointAndDirectionFromPathFraction, this.state.vp, this.state.attrValues.keyDown);
          this._updateTimeline(nextPathFraction);
        }
      }
      if (this.state.attrValues.sliderValue === 1) {
        initialPositionStarted = false;
        this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: initialPositionStarted } }));
      }
    });
  }

  public handleScrollAnimation = (eventDeltaY: number) => {
    if (((this.state.attrValues.sliderValue === 1) && (eventDeltaY > 0)) || ((this.state.attrValues.sliderValue === 0) && (eventDeltaY < 0)))
      return;
    if (this.state.attrValues.isPause) {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isMouseWheelAnimationActive: false } }), () => setTimeout(() => { this._handleScrollPath(eventDeltaY); }, 5));
    } else {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isPause: true } }), () => setTimeout(() => { this._handleScrollPath(eventDeltaY); }, 40));
    }
  }
  public handleUnlockDirection = (keyDown: boolean) => {
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, keyDown } }));
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
