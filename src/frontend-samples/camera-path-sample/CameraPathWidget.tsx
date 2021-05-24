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
  const [lookAround, setLookAround] = useState<boolean>(true);
  const [cameraPath, setCameraPath] = useState<CameraPath>(CameraPath.createByLoadingFromJson("TrainPath"));
  const [isPaused, setIsPaused] = useState<boolean>(true);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [speedLevel, setSpeedLevel] = useState<string>("3 Mph: Walking");
  const [currentSpeed, setCurrentSpeed] = useState<number>(1.4);
  const [isMouseWheelAnimationActive, setIsMouseWheelAnimationActive] = useState<boolean>(false);
  const [keyDown, setKeyDown] = useState<boolean>(false);

  /** Initalize the camera namespace on widget load */
  useEffect(() => {
    const sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    CameraPathTool.register(sampleNamespace);

    return () => {
      IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
      IModelApp.tools.unRegister(CameraPathTool.toolId);
    };
  }, []);

  const handleUnlockDirection = (isKeyDown: boolean) => {
    setKeyDown(isKeyDown);
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
    const nextPathPoint = cameraPath.getPathPoint(nextPathFraction);
    await CameraPathApi.animateCameraPath(nextPathPoint, viewport, keyDown);
    setSliderValue(nextPathFraction);
    if (sliderValue === 1) {
      setIsPaused(true);
      setIsMouseWheelAnimationActive(false);
    }
  }, [viewport, cameraPath, sliderValue, keyDown]);

  const handleScrollAnimation = useCallback((eventDeltaY: number) => {
    if (((sliderValue === 1) && (eventDeltaY > 0)) || ((sliderValue === 0) && (eventDeltaY < 0)))
      return;

    // If the user interrupts the animation with a scroll, pause it.
    if (!isPaused) {
      setIsPaused(true);
    }

    _handleScrollPath(eventDeltaY);
  }, [_handleScrollPath, isPaused, sliderValue]);

  // We will use this method to activate the CameraPathTool
  // The CameraPathTool will prevent the view tool and standard mouse events
  const toolActivation = useCallback(() => {
    IModelApp.tools.run(CameraPathTool.toolId, handleScrollAnimation, handleUnlockDirection);
  }, [handleScrollAnimation]);

  /** Turn the camera on, and initalize the tool */
  useEffect(() => {
    if (viewport && cameraPath) {
      viewport.turnCameraOn();
      toolActivation();
      CameraPathApi.prepareView(viewport);
    }
  }, [viewport, cameraPath, toolActivation]);

  /** When the slider Value is changed, change the view to reflect the position in the path */
  useEffect(() => {
    if (viewport && cameraPath && !isMouseWheelAnimationActive) {
      const nextPathPoint = cameraPath.getPathPoint(sliderValue);
      CameraPathApi.setViewFromPathPoint(nextPathPoint, viewport);
    }
  }, [viewport, sliderValue, cameraPath, isMouseWheelAnimationActive]);

  /** When the slider value changes, and the the user is currently playing, advance to the next point in the path at the current speed */
  useEffect(() => {
    if (!isPaused && sliderValue < 1 && !isMouseWheelAnimationActive) {
      const nextPathFraction = cameraPath.advanceAlongPath(sliderValue, currentSpeed / 30);
      const nextPathPoint = cameraPath.getPathPoint(nextPathFraction);
      CameraPathApi.animateCameraPath(nextPathPoint, viewport!, keyDown)
        .then(() => {
          setSliderValue(nextPathFraction);
        });
    } else if (sliderValue >= 1 && !isPaused) {
      setIsPaused(true);
    }
  }, [sliderValue, isPaused, cameraPath, currentSpeed, viewport, keyDown, isMouseWheelAnimationActive]);

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
    setSliderValue(sliderNumber);
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

  // Handle the Path Change
  const _onChangeRenderPath = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSliderValue(0);
    setCameraPath(CameraPath.createByLoadingFromJson(event.target.value));
  };

  // Create the react components for the  Paths
  const _createRenderPath = (label: string) => {
    const options = { TrainPath: "Train Path", FlyoverPath: "Fly Over", CommuterPath: "Commuter View" };
    const element = <Select style={{ width: "fit-content", marginLeft: "12px" }} disabled={!isPaused} onChange={_onChangeRenderPath} options={options} />;
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
    const element = <Select style={{ width: "140px", marginLeft: "48px" }} options={["1 Mph: Slow Walk", "3 Mph: Walking", "30 Mph: Car", "60 Mph: Fast Car", "150 Mph: Airplane"]} value={speedLevel} onChange={(event: React.ChangeEvent<HTMLSelectElement>) => _onChangeRenderSpeed(event.target.value)} />;
    return _createJSXElementForAttribute(label, element);
  };

  // const selectToolActivation = () => {
  //   IModelApp.toolAdmin.startDefaultTool();
  // };

  // useEffect(() => {
  //   //toolActivation();
  //   if (lookAround) {
  //     toolActivation();
  //   } else {
  //     selectToolActivation();
  //   }
  // }, [lookAround, toolActivation]);

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
          <button style={{ width: "35px", marginLeft: "4px", background: "grey", padding: "2px 0px 0px 2px", borderWidth: "1px", borderColor: "black", height: "32px", borderRadius: "50px", outline: "none" }} onClick={() => _handleCameraPlay()} >
            {isPaused ? <img src="Play_32.png" style={{ height: "25px" }}></img>
              : <img src="MediaControlsPause.ico" style={{ height: "25px" }} />}
          </button>
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