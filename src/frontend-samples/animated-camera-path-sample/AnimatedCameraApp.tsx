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
export interface AttrValues {
  isPause: boolean;
  sliderValue: number;
  isUnlockDirectionOn: boolean;
  speedLevel: string;
  animationSpeed: number;
  pathDelay: number;
}

export enum AnimationSpeed {
  Slowest = 1,
  Slower,
  Default,
  Faster,
  Fastest
}

export enum PathDelay {
  Slowest = 1,
  Slower = 10,
  Default = 20,
  Faster = 30,
  Fastest = 40
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class AnimatedCameraApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    AnimatedCameraTool.register(this._sampleNamespace);
    return <AnimatedCameraUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }
  private static _sampleNamespace: I18NNamespace;
  public static countPathTravelled: number = 0
  public static isInitialPositionStarted: boolean = false;
  public static isPaused: boolean = false;
  public static isUnlockDirectionOn: boolean = false;
  public static keyDown: boolean = false;
  public static isAnimatedCameraToolActive: boolean = false;

  //
  public static animateCameraPlay(pathArray: CameraPoint[]) {
    if (!AnimatedCameraApp.isInitialPositionStarted) {
      for (const coordinate of pathArray) {
        coordinate.isTraversed = false;
      }
      AnimatedCameraApp.countPathTravelled = 0;
      AnimatedCameraApp.isInitialPositionStarted = true;
      AnimatedCameraApp.isPaused = false;
    }
    else {
      AnimatedCameraApp.isPaused = !AnimatedCameraApp.isPaused;
    }
    AnimatedCameraApp.toolActivation();
  }

  // We will use this method to activate and deactivate the AnimatedCameraTool while animation  is on and off respectively. The AnimatedCameraTool will prevent the view tool and standard mouse events when activated and when deactivated ,data and reset events will be directed to the Idle tool.
  public static toolActivation() {
    if (!AnimatedCameraApp.isPaused && !AnimatedCameraApp.isAnimatedCameraToolActive) {
      AnimatedCameraApp.isAnimatedCameraToolActive = true;
      IModelApp.tools.run(AnimatedCameraTool.toolId);
    }
    else if ((!AnimatedCameraApp.isInitialPositionStarted || AnimatedCameraApp.isPaused) && AnimatedCameraApp.isAnimatedCameraToolActive) {
      AnimatedCameraApp.isAnimatedCameraToolActive = false;
      IModelApp.tools.run(SelectionTool.toolId); // will stop the AnimatedCameraTool and run the default tool as mentioned here : https://www.itwinjs.org/learning/frontend/tools/#tooladmin
    }
  }

  public static async animateCameraPath(cameraPoint: CameraPoint, pathArray: CameraPoint[], animationSpeed: number, pathDelay: number, viewport: Viewport) {
    if (pathArray.indexOf(cameraPoint) % animationSpeed === 0) {
      if (!AnimatedCameraApp.isUnlockDirectionOn)
        (viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.point, cameraPoint.direction, new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
      else
        (viewport.view as ViewState3d).setEyePoint(cameraPoint.point);
      viewport.synchWithView();
      await AnimatedCameraApp.delay(pathDelay);
    }
    cameraPoint.isTraversed = true;
    AnimatedCameraApp.countPathTravelled++;
  }

  public static setViewFromPointAndDirection(pathArray: CameraPoint[], sliderValue: string, viewport: Viewport) {
    AnimatedCameraApp.isInitialPositionStarted = true;
    (viewport.view as ViewState3d).lookAtUsingLensAngle(pathArray[Number(sliderValue)].point, pathArray[Number(sliderValue)].direction, new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    viewport.synchWithView();
    for (const coordinate of pathArray) {
      if (pathArray.indexOf(coordinate) <= Number(sliderValue)) {
        coordinate.isTraversed = true;
      }
      else
        coordinate.isTraversed = false;
    }
    AnimatedCameraApp.toolActivation();
  }

  public static loadCameraPath(pathname: string): CameraPoint[] {
    const trainPathInterpolateValue: number = 0.00015; // Fraction of interpolation to get coordinates of Train Path
    const flyoverPathInterpolateValue: number = 0.0002; // Fraction of interpolation to get coordinates of Flyover Path
    const commuterPathInterpolateValue: number = 0.0025; // Fraction of interpolation to get coordinates of commuter Path
    const cameraPoints: CameraPoint[] = [];
    switch (pathname) {
      case "TrainPath":
        trainPathCoordinates.forEach((item, index) => {
          if (index !== trainPathCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + trainPathInterpolateValue) {
              cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].cameraPoint.x, trainPathCoordinates[index + 1].cameraPoint.y, trainPathCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].viewDirection.x, trainPathCoordinates[index + 1].viewDirection.y, trainPathCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;

      case "FlyoverPath":
        flyoverCoordinates.forEach((item, index) => {
          if (index !== flyoverCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + flyoverPathInterpolateValue) {
              cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(flyoverCoordinates[index + 1].cameraPoint.x, flyoverCoordinates[index + 1].cameraPoint.y, flyoverCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(flyoverCoordinates[index + 1].viewDirection.x, flyoverCoordinates[index + 1].viewDirection.y, flyoverCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;

      case "CommuterPath":
        commuterViewCoordinates.forEach((item, index) => {
          if (index !== commuterViewCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + commuterPathInterpolateValue) {
              cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(commuterViewCoordinates[index + 1].cameraPoint.x, commuterViewCoordinates[index + 1].cameraPoint.y, commuterViewCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(commuterViewCoordinates[index + 1].viewDirection.x, commuterViewCoordinates[index + 1].viewDirection.y, commuterViewCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
    }
    return cameraPoints;
  }

  public static async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static teardown() {
    IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
    IModelApp.tools.unRegister(AnimatedCameraTool.toolId);
  }
}

