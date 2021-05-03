import React, { useCallback, useEffect, useState } from "react";
import { useActiveViewport } from "@bentley/ui-framework";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Select } from "@bentley/ui-core";
import CameraPathApi, { CameraPath } from "./CameraPathApi";
import { CameraPathTool } from "./CameraPathTool";
import "./CameraPath.scss";

const CameraPathWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [lookAround, setLookAround] = useState<boolean>(false);
  const [cameraPath, setCameraPath] = useState<CameraPath>(CameraPath.createByLoadingFromJson("TrainPath"));
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [speedLevel, setSpeedLevel] = useState<string>("3 Mph: Walking");
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [isInitialPositionStarted, setIsInitialPositionStarted] = useState<boolean>(false);
  const [isMouseWheelAnimationActive, setIsMouseWheelAnimationActive] = useState<boolean>(false);
  const [keyDown, setKeyDown] = useState<boolean>(false);

  useEffect(() => {
    const sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    CameraPathTool.register(sampleNamespace);

    return () => {
      IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
      IModelApp.tools.unRegister(CameraPathTool.toolId);
    };
  }, []);

  // useEffect(() => {
  //   if (viewport) {
  //     getInitialView(viewport);
  //   }
  // }, [viewport]);

  useEffect(() => {
    if (viewport && cameraPath) {
      viewport.turnCameraOn();
      toolActivation();
      viewport.invalidateRenderPlan();
      const nextPointAndDirectionFromPathFraction = cameraPath.getPointAndDirection(0);
      CameraPathApi.setViewFromPointAndDirection(nextPointAndDirectionFromPathFraction, viewport);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cameraPath, viewport]);

  useEffect(() => {
    if (viewport && cameraPath && isPaused && !isMouseWheelAnimationActive) {
      const nextPointAndDirectionFromPathFraction = cameraPath.getPointAndDirection(sliderValue);
      CameraPathApi.setViewFromPointAndDirection(nextPointAndDirectionFromPathFraction, viewport);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport, sliderValue, cameraPath]);

  useEffect(() => {
    if (!isPaused && sliderValue < 1) {
      const nextPathFraction = cameraPath.advanceAlongPath(sliderValue, currentSpeed / 30);
      const nextPointAndDirectionFromPathFraction = cameraPath.getPointAndDirection(nextPathFraction);
      CameraPathApi.animateCameraPath(nextPointAndDirectionFromPathFraction, viewport!, keyDown)
        .then(() => {
          _updateTimeline(nextPathFraction);
        });
    } else if (sliderValue >= 1 && !isPaused) {
      setIsPaused(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderValue, isPaused]);

  // This common function is used to create the react components for each row of the UI.
  const _createJSXElementForAttribute = (label: string, element: JSX.Element) => {
    return (
      <>
        <span style={{ marginLeft: "6px", marginRight: "0px" }}>{label}</span>
        {element}
      </>
    );
  };

  const _onChangeCameraSliderValue = (sliderNumber: number) => {
    if (!isPaused) {
      setIsPaused(true);
    }
    setSliderValue(sliderNumber)
  };

  // Create the react component for the  slider
  const _createCameraSlider = (label: string) => {
    const element = <input type={"range"} min={0.0} max={1.0} value={sliderValue} style={{ marginLeft: "10px", width: "150px" }} step={Math.pow(10, -10)}
      onChange={async (event: React.ChangeEvent<HTMLInputElement>) => {
        const sliderNumber: number = Number(event.target.value);
        _onChangeCameraSliderValue(sliderNumber);
      }
      } />;
    return _createJSXElementForAttribute(label, element);
  };

  // Update the States for the Play / Pause button click event
  const _handleCameraPlay = () => {
    const isCameraPaused = !isPaused;
    if (!isCameraPaused && sliderValue === 1) {
      setSliderValue(0);
    }
    setIsPaused(isCameraPaused);
    setIsMouseWheelAnimationActive(false);
  };

  // Handle the Camera Animation
  // private async _handleCameraPathAnimation() {
  //   if (this.state.vp === undefined)
  //     return;
  //   let pathCompleted: boolean = true;
  //   while (this.state.attrValues.sliderValue < 1) {
  //     if (this.state.attrValues.isPause) {
  //       pathCompleted = false;
  //       break;
  //     }
  //     const nextPathFraction = this.state.cameraPath.advanceAlongPath(this.state.attrValues.sliderValue, this.state.attrValues.currentSpeed / 30);
  //     const nextPathPoint = this.state.cameraPath.getPathPoint(nextPathFraction);
  //     await CameraPathApi.animateCameraPath(nextPathPoint, this.state.vp, this.state.attrValues.keyDown);
  //     this._updateTimeline(nextPathFraction);
  //   }
  //   if (pathCompleted) {
  //     this.setState((previousState) => ({ attrValues: { ...previousState.attrValues, isInitialPositionStarted: false } }));
  //   }
  // }

  // Handle the Path Change
  const _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCameraPath(CameraPath.createByLoadingFromJson(event.target.value));
  };

  // Create the react components for the  Paths
  const _createRenderPath = (label: string) => {
    const options = { TrainPath: "Train Path", FlyoverPath: "Fly Over", CommuterPath: "Commuter View" };
    const element = <Select style={{ width: "fit-content", marginLeft: "12px" }} onChange={_onChangeRenderPath} options={options} />;
    return _createJSXElementForAttribute(label, element);
  };

  // Handle the speed level change
  const _onChangeRenderSpeed = (currSpeed: string) => {
    let speedOfMotion: number = 0;
    switch (currSpeed) {
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
    setCurrentSpeed(speedOfMotion);
    setSpeedLevel(currSpeed);
  };

  // Create the react component for the camera speed dropdown
  const _createSpeedDropDown = (label: string) => {
    const element = <Select style={{ width: "140px", marginLeft: "48px" }} options={["1 Mph: Slow Walk", "3 Mph: Walking", "30 Mph: Car", "60 Mph: Fast Car", "150 Mph: Airplane"]} value={attrValues.speedLevel} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => _onChangeRenderSpeed(event.target.value)} />;
    return _createJSXElementForAttribute(label, element);
  };

  // Update the Slider timeline continuously while animation is active
  const _updateTimeline = (pathFractionCompleted: number) => {
    setSliderValue(pathFractionCompleted);
  };

  const selectToolActivation = () => {
    IModelApp.toolAdmin.startDefaultTool();
  };

  const _handleScrollPath = useCallback(async (eventDeltaY: number) => {
    if (viewport === undefined)
      return;
    const stepLength = (cameraPath.getLength() / 10) / 30;
    let cameraPathIterationValue: number = sliderValue;
    if (eventDeltaY > 0) {
      cameraPathIterationValue += 0.009;
      if (cameraPathIterationValue > 1)
        cameraPathIterationValue = 1;
    } else if (eventDeltaY < 0) {
      cameraPathIterationValue -= 0.009;
      if (cameraPathIterationValue < 0)
        cameraPathIterationValue = 0;
    }
    setIsMouseWheelAnimationActive(true);
    setSliderValue(cameraPathIterationValue);
    const nextPathFraction = cameraPath.advanceAlongPath(cameraPathIterationValue, stepLength);
    const nextPointAndDirectionFromPathFraction = cameraPath.getPointAndDirection(nextPathFraction);
    await CameraPathApi.animateCameraPath(nextPointAndDirectionFromPathFraction, viewport, keyDown);
    _updateTimeline(nextPathFraction);
    if (sliderValue === 1) {
      setIsPaused(true);
      setIsMouseWheelAnimationActive(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sliderValue, cameraPath, viewport]);

  const handleScrollAnimation = useCallback((eventDeltaY: number) => {
    if (((sliderValue === 1) && (eventDeltaY > 0)) || ((sliderValue === 0) && (eventDeltaY < 0)))
      return;
    if (isPaused) {
      _handleScrollPath(eventDeltaY);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [_handleScrollPath]);

  // We will use this method to activate the CameraPathTool
  // The CameraPathTool will prevent the view tool and standard mouse events
  const toolActivation = useCallback(() => {
    IModelApp.tools.run(CameraPathTool.toolId, handleScrollAnimation, handleUnlockDirection);
  }, [handleScrollAnimation]);

  useEffect(() => {
    if (lookAround) {
      toolActivation();
    } else {
      selectToolActivation();
    }
  }, [lookAround, toolActivation]);

  const handleUnlockDirection = (isKeyDown: boolean) => {
    setKeyDown(isKeyDown);
  };

  // public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
  //   const viewState = await ViewSetup.getDefaultView(imodel);
  //   viewState.viewFlags.renderMode = RenderMode.SmoothShade;
  //   return viewState;
  // };

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div>
        <div className="sample-options-2col" style={{ maxWidth: "310px" }}>
          {_createRenderPath("Path")}
        </div>
        <div className="sample-options-2col" style={{ maxWidth: "310px" }}>
          {_createCameraSlider("Progress Bar")}
        </div>
        <div className="sample-options-3col" style={{ maxWidth: "310px" }}>
          {_createSpeedDropDown("Animate")}
          <button style={{ width: "35px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={() => this._handleCameraPlay()} >{this.state.attrValues.isInitialPositionStarted ? this.state.attrValues.isPause ? <img src="Play_32.png" style={{ height: "25px" }}></img> : <img src="MediaControlsPause.ico" style={{ height: "25px" }} /> : <img src="Play_32.png" style={{ height: "25px" }}></img>}</button>
        </div>
      </div >
    </div>
  );
};

export class CameraPathWidgetProvider implements UiItemsProvider {
  public readonly id: string = "CameraPathWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "CameraPathWidget",
          label: "Camera Path Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <CameraPathWidget />,
        }
      );
    }
    return widgets;
  }
}
