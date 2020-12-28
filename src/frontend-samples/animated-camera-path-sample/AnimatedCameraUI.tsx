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
    this.state = { attrValues: { isPause: false, sliderValue: 0, isUnlockDirectionOn: false, speedLevel: "Default", animationSpeed: AnimationSpeed.Default, pathDelay: PathDelay.Default, isInitialPositionStarted: false }, PathArray: [] };
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
        const sliderNumber: string = event.target.value;
        AnimatedCameraApp.isPaused = true;
        setTimeout(() => {
          let initialPositionStarted: boolean = true;
          if (Number(sliderNumber) === this.state.PathArray.length - 1)
            initialPositionStarted = false;
          this.setState((previousState) =>
            ({ attrValues: { ...previousState.attrValues, sliderValue: Number(sliderNumber), isInitialPositionStarted: initialPositionStarted } }), () => {
              if (this.state.vp)
                AnimatedCameraApp.setViewFromPointAndDirection(this.state.PathArray, this.state.attrValues.sliderValue, this.state.vp)
              AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted);
            });
        }, 20);
      }
      } />;
    return this.createJSXElementForAttribute(label, element);
  }

  // Create the react component for the  Play button
  private handleCameraPlay() {
    if (undefined === this.state.vp)
      return;
    if (!this.state.attrValues.isInitialPositionStarted) {
      for (const coordinate of this.state.PathArray) {
        coordinate.isTraversed = false;
      }
      //AnimatedCameraApp.countPathTravelled = 0;
      AnimatedCameraApp.isPaused = false;
      this.setState((previousState) =>
        ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: true, sliderValue: 0 } }), () => {
          AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted);
          this.handleCameraPathAnimation();
        });

    }
    else {
      AnimatedCameraApp.isPaused = !AnimatedCameraApp.isPaused;
      AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted);
      this.handleCameraPathAnimation();
    }
  }

  public async handleCameraPathAnimation() {
    if (undefined === this.state.vp)
      return;
    let pathCompleted: boolean = true;
    let pathCountCompleted: number = 0;
    for (const cameraPoint of this.state.PathArray) {
      if (cameraPoint.isTraversed)
        continue;
      if (AnimatedCameraApp.isPaused) {
        pathCompleted = false;
        break;
      }
      pathCountCompleted = await AnimatedCameraApp.animateCameraPath(cameraPoint, this.state.PathArray, this.state.attrValues.animationSpeed, this.state.attrValues.pathDelay, this.state.attrValues.isUnlockDirectionOn, this.state.attrValues.sliderValue, this.state.vp);
      cameraPoint.isTraversed = true;
      this.updateTimeline(pathCountCompleted);
    }
    if (pathCompleted) {
      this.setState((previousState) =>
        ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: false } }), () => {
          AnimatedCameraApp.toolActivation(this.state.attrValues.isInitialPositionStarted);
        });
    }
    this.updateTimeline(pathCountCompleted);
  }

  private _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.vp)
      return;
    AnimatedCameraApp.isPaused = true;
    // AnimatedCameraApp.countPathTravelled = 0;
    AnimatedCameraTool.isUnlockDirectionOn = false;
    const cameraPoints: CameraPoint[] = AnimatedCameraApp.loadCameraPath(event.target.value);
    (this.state.vp.view as ViewState3d).lookAtUsingLensAngle(cameraPoints[0].point, cameraPoints[0].direction, new Vector3d(0, 0, 1), (this.state.vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    this.state.vp.synchWithView();
    AnimatedCameraApp.toolActivation(false);
    setTimeout(() => {
      this.setState((previousState) =>
        ({ attrValues: { ...previousState.attrValues, isPause: AnimatedCameraApp.isPaused, sliderValue: 0, isInitialPositionStarted: false, isUnlockDirectionOn: false }, PathArray: cameraPoints }));
    }, 0);
  }

  // Create the react components for the render Path
  private _createRenderPath(label: string) {
    const options = { TrainPath: "Train Path", FlyoverPath: "Fly Over", CommuterPath: "Commuter View" }
    const element = <Select style={{ width: "fit-content", marginLeft: "34px" }} onChange={this._onChangeRenderPath} options={options} />;
    return this.createJSXElementForAttribute(label, element);
  }

  // Handle changes to the  Direction toggle.
  private _onChangeDirectionToggle = (checked: boolean) => {
    let unlockDirectionFlag: boolean;
    if (checked)
      unlockDirectionFlag = true;
    else
      unlockDirectionFlag = false;
    AnimatedCameraTool.isUnlockDirectionOn = unlockDirectionFlag;
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, isUnlockDirectionOn: unlockDirectionFlag } }));

  }

  // Create the react components for the camera toggle row.
  private _createDirectionToggle(label: string) {
    const element = <Toggle style={{ marginLeft: "30px" }} isOn={this.state.attrValues.isUnlockDirectionOn} onChange={(checked: boolean) => this._onChangeDirectionToggle(checked)} />;
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
          <button style={{ width: "35px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={() => this.handleCameraPlay()} >{this.state.attrValues.isInitialPositionStarted ? AnimatedCameraApp.isPaused ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
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

  public updateTimeline(pathCountCompleted: number) {
    this.setState((previousState) =>
      ({ attrValues: { ...previousState.attrValues, sliderValue: pathCountCompleted } }));
  }
  //
  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      AnimatedCameraApp.isPaused = false;
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
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} isNavigationToolInvisible={this.state.attrValues.isInitialPositionStarted ? !AnimatedCameraApp.isPaused : false} />
      </>
    );
  }
}
