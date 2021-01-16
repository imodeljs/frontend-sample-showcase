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
import CameraPathApp, { CameraPoint, CoordinateTraversalFrequency } from "./CameraPathApp";
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
    coordinateTraversalFrequency: number;
    pathDelay: number;
    isInitialPositionStarted: boolean;
    isMouseWheelAnimationActive: boolean;
  };
  PathArray: CameraPoint[];
}

/** A React component that renders the UI specific for this sample */
export default class CameraPathUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, CameraPathUIAttributeState> {
  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = { attrValues: { isPause: false, sliderValue: 0, speedLevel: "3 Mph: Walking", coordinateTraversalFrequency: CoordinateTraversalFrequency.Default, pathDelay: 0, isInitialPositionStarted: false, isMouseWheelAnimationActive: false }, PathArray: [] };
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
    let pathCompletedCount: number = 0;
    for (let i: number = this.state.attrValues.sliderValue + 1; i <= this.state.PathArray.length - 1; i++) {
      if (this.state.attrValues.isPause) {
        pathCompleted = false;
        break;
      }
      pathCompletedCount = await CameraPathApp.animateCameraPath(this.state.PathArray[i], i, this.state.attrValues.coordinateTraversalFrequency, this.state.attrValues.pathDelay, this.state.attrValues.sliderValue, this.state.vp);
      this._updateTimeline(pathCompletedCount);
    }
    if (pathCompleted) {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: false } })); // () => AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted, this.state.attrValues.isPause));
    }
  }

  // Handle the Path Change
  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const cameraPoints: CameraPoint[] = CameraPathApp.loadCameraPath(event.target.value, 1.4); // The normal human walking Speed is 1.4 meters/second
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isPause: true, isMouseWheelAnimationActive: false, isInitialPositionStarted: false, isUnlockDirectionOn: false }, PathArray: cameraPoints }), () => {
      setTimeout(() => {
        if (this.state.vp) {
          CameraPathApp.setViewFromPointAndDirection(this.state.PathArray[0], this.state.vp);
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
  private _onChangeRenderSpeed = (currentSpeed: string) => {
    let speedOfMotion: number = 0;
    let frequencyOfCoordinateTraversal: number; // will regulate the speed based on Coordinate Traversal Frequency at different Speed Levels
    let pathTotalDistance: number = 0;
    this.state.PathArray.forEach((item, index) => {
      if (index !== this.state.PathArray.length - 1)
        pathTotalDistance += item.point.distance(this.state.PathArray[index + 1].point);
    });
    switch (currentSpeed) {
      case "1 Mph: Slow Walk":
        speedOfMotion = 0.4; // 1Mph = 0.4 meters/second
        frequencyOfCoordinateTraversal = CoordinateTraversalFrequency.Default;
        break;
      case "3 Mph: Walking":
        speedOfMotion = 1.4; // 3Mph = 1.4 meters/second
        frequencyOfCoordinateTraversal = CoordinateTraversalFrequency.Default;
        break;
      case "30 Mph: Car":
        speedOfMotion = 13.4; // 30Mph = 13.4 meters/second
        frequencyOfCoordinateTraversal = CoordinateTraversalFrequency.Fast;
        break;
      case "60 Mph: Fast Car":
        speedOfMotion = 46.8; // 60Mph = 26.8 meters/second
        frequencyOfCoordinateTraversal = CoordinateTraversalFrequency.Faster;
        break;
      case "150 Mph: Airplane":
        speedOfMotion = 67.05; // 150Mph = 67.05 meters/second
        frequencyOfCoordinateTraversal = CoordinateTraversalFrequency.Fastest;
        break;
    }
    const delay = pathTotalDistance / (speedOfMotion * this.state.PathArray.length);  // Time taken to travel between 2 coordinates = Total time taken to travel the Path/length of pathArray
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, speedLevel: currentSpeed, pathDelay: delay, coordinateTraversalFrequency: frequencyOfCoordinateTraversal } }));
  }

  // Create the react component for the camera speed dropdown
  private _createSpeedDropDown(label: string) {
    const element = <Select style={{ width: "140px", marginLeft: "48px" }} options={["1 Mph: Slow Walk", "3 Mph: Walking", "30 Mph: Car", "60 Mph: Fast Car", "150 Mph: Airplane"]} value={this.state.attrValues.speedLevel} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => this._onChangeRenderSpeed(event.target.value)} />
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
  private _updateTimeline(pathCountCompleted: number) {
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, sliderValue: pathCountCompleted } }));
  }

  public onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      const cameraPoints: CameraPoint[] = CameraPathApp.loadCameraPath("TrainPath", 1.4); // The normal human walking Speed is 1.4 meters/second
      this.setState({ vp, PathArray: cameraPoints }, () => {
        if (this.state.vp) {
          this.toolActivation();
          CameraPathApp.setViewFromPointAndDirection(this.state.PathArray[0], this.state.vp);
          this._onChangeRenderSpeed(this.state.attrValues.speedLevel);
        }
      });
    });
  }

  // We will use this method to activate the CameraPathTool
  // The CameraPathTool will prevent the view tool and standard mouse events
  private toolActivation() {
    IModelApp.tools.run(CameraPathTool.toolId, this._handleScrollAnimation);
  }

  private _handleScrollPath(eventDeltaY: number) {
    let initialPositionStarted: boolean = true;
    this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isMouseWheelAnimationActive: true, isInitialPositionStarted: initialPositionStarted } }), async () => {
      if (this.state.vp === undefined)
        return;
      let pathCompletedCount: number = 0;
      const sliderValue = this.state.attrValues.sliderValue;
      let cameraPathIterationValue: number;
      if (eventDeltaY > 0) {
        cameraPathIterationValue = sliderValue + (this.state.PathArray.length / 10);  // Increase the path motion distance from current coordinate to (length of path)/10
        if (cameraPathIterationValue > this.state.PathArray.length - 1)
          cameraPathIterationValue = this.state.PathArray.length - 1;
        for (let i: number = sliderValue + 1; i <= cameraPathIterationValue; i++) {
          if (!this.state.attrValues.isMouseWheelAnimationActive)
            break;
          pathCompletedCount = await CameraPathApp.animateCameraPath(this.state.PathArray[i], i, this.state.attrValues.coordinateTraversalFrequency, this.state.attrValues.pathDelay, this.state.attrValues.sliderValue, this.state.vp);
          this._updateTimeline(pathCompletedCount);
        }
      } else if (eventDeltaY < 0) {
        cameraPathIterationValue = sliderValue - (this.state.PathArray.length / 10); // Decrease the path motion distance from current coordinate to (length of path)/10
        if (cameraPathIterationValue < 0)
          cameraPathIterationValue = 0;
        for (let i: number = sliderValue; i >= cameraPathIterationValue; i--) {
          if (!this.state.attrValues.isMouseWheelAnimationActive)
            break;
          pathCompletedCount = this.state.attrValues.sliderValue - 1
          await CameraPathApp.animateCameraPath(this.state.PathArray[i], i, this.state.attrValues.coordinateTraversalFrequency, this.state.attrValues.pathDelay, this.state.attrValues.sliderValue, this.state.vp);
          this._updateTimeline(pathCompletedCount);
        }
      }
      if (this.state.attrValues.sliderValue === this.state.PathArray.length - 1) {
        initialPositionStarted = false;
        this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: initialPositionStarted } }));
      }
    });
  }

  public _handleScrollAnimation = (eventDeltaY: number) => {
    if (((this.state.attrValues.sliderValue === this.state.PathArray.length - 1) && (eventDeltaY > 0)) || ((this.state.attrValues.sliderValue === 0) && (eventDeltaY < 0)))
      return;
    if (this.state.attrValues.isPause) {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isMouseWheelAnimationActive: false } }), () => setTimeout(() => { this._handleScrollPath(eventDeltaY) }, 5));
    } else {
      this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isPause: true } }), () => setTimeout(() => { this._handleScrollPath(eventDeltaY) }, 40));
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
