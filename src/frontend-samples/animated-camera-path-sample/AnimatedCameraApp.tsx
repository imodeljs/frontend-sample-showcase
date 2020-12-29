/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, SelectionTool, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import AnimatedCameraUI from "./AnimatedCameraUI";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { AnimatedCameraTool } from "./AnimatedCameraTool";
import SampleApp from "common/SampleApp";
import { Point3d, Vector3d } from "@bentley/geometry-core";
import { commuterViewCoordinates, flyoverCoordinates, trainPathCoordinates } from "./Coordinates";

export interface CameraPoint {
  point: Point3d;
  direction: Point3d;
  isTraversed: boolean;
}
export interface AnimatedCameraAttrValues {
  isPause: boolean;
  sliderValue: number;
  isUnlockDirectionOn: boolean;
  speedLevel: string;
  animationSpeed: number;
  pathDelay: number;
  isInitialPositionStarted: boolean;
}

// The level of Animation Speed
export enum AnimationSpeed {
  Slowest = 1,
  Slower,
  Default,
  Faster,
  Fastest
}

// For Delay between two Coordinates while animation is Active
export enum PathDelay {
  Slowest = 1,
  Slower = 10,
  Default = 20,
  Faster = 30,
  Fastest = 40
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class AnimatedCameraApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    AnimatedCameraTool.register(this._sampleNamespace);
    return <AnimatedCameraUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static async animateCameraPath(cameraPoint: CameraPoint, pathArray: CameraPoint[], animationSpeed: number, pathDelay: number, isUnlockDirectionOn: boolean, countPathTravelled: number, viewport: Viewport) {
    if (pathArray.indexOf(cameraPoint) % animationSpeed === 0) {
      if (!isUnlockDirectionOn)
        (viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.point, cameraPoint.direction, new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
      else
        (viewport.view as ViewState3d).setEyePoint(cameraPoint.point);
      viewport.synchWithView();
      await AnimatedCameraApp.delay(pathDelay);
    }

    return ++countPathTravelled;
  }

  public static setViewFromPointAndDirection(pathArray: CameraPoint[], sliderValue: number, viewport: Viewport) {
    (viewport.view as ViewState3d).lookAtUsingLensAngle(pathArray[Number(sliderValue)].point, pathArray[Number(sliderValue)].direction, new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    viewport.synchWithView();
    for (const coordinate of pathArray) {
      if (pathArray.indexOf(coordinate) <= sliderValue) {
        coordinate.isTraversed = true;
      }
      else
        coordinate.isTraversed = false;
    }
  }

  // load the Coordinates while onModelReady and changing the Camera Path
  public static loadCameraPath(pathName: string): CameraPoint[] {
    const trainPathInterpolateValue: number = 0.00015; // Fraction of interpolation to get coordinates of Train Path
    const flyoverPathInterpolateValue: number = 0.00020; // Fraction of interpolation to get coordinates of Flyover Path
    const commuterPathInterpolateValue: number = 0.00250; // Fraction of interpolation to get coordinates of commuter Path
    const cameraPoints: CameraPoint[] = [];
    let pathInterpolationValue: number;
    let currentPathCoordinates: typeof trainPathCoordinates = [];
    switch (pathName) {
      case "TrainPath":
        pathInterpolationValue = trainPathInterpolateValue;
        currentPathCoordinates = trainPathCoordinates;
        break;

      case "FlyoverPath":
        pathInterpolationValue = flyoverPathInterpolateValue;
        currentPathCoordinates = flyoverCoordinates;
        break;

      case "CommuterPath":
        pathInterpolationValue = commuterPathInterpolateValue;
        currentPathCoordinates = commuterViewCoordinates;
    }
    currentPathCoordinates.forEach((item, index) => {
      if (index !== currentPathCoordinates.length - 1) {
        for (let j: number = 0.00; j <= 1.0; j = j + pathInterpolationValue) {
          cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(currentPathCoordinates[index + 1].cameraPoint.x, currentPathCoordinates[index + 1].cameraPoint.y, currentPathCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(currentPathCoordinates[index + 1].viewDirection.x, currentPathCoordinates[index + 1].viewDirection.y, currentPathCoordinates[index + 1].viewDirection.z)), isTraversed: false });
        }
      }
    });
    return cameraPoints;
  }

  // We will use this method to activate and deactivate the AnimatedCameraTool while animation is on and off respectively
  // The AnimatedCameraTool will prevent the view tool and standard mouse events when activated
  // and when deactivated ,data and reset events will be directed to the Idle tool
  public static toolActivation(isInitialPositionStarted: boolean, isPaused: boolean) {
    if (!isPaused && !AnimatedCameraTool.isAnimatedCameraToolActive) {
      AnimatedCameraTool.isAnimatedCameraToolActive = true;
      IModelApp.tools.run(AnimatedCameraTool.toolId);
    }
    else if ((!isInitialPositionStarted || isPaused) && AnimatedCameraTool.isAnimatedCameraToolActive) {
      AnimatedCameraTool.isAnimatedCameraToolActive = false;
      IModelApp.tools.run(SelectionTool.toolId); // will stop the AnimatedCameraTool  :
      // and run the default tool as mentioned here : https://www.itwinjs.org/learning/frontend/tools/#tooladmin
    }
  }

  // For Delay between two Coordinates while animation is Active
  public static async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static teardown() {
    IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
    IModelApp.tools.unRegister(AnimatedCameraTool.toolId);
  }
}

