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
import { Frustum } from "@bentley/imodeljs-common";
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
  speed: string;
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
  public static currentFrustum: Frustum;
  public static initialFrustum: Frustum;
  public static viewport: Viewport;
  public static isUnlockDirectionOn: boolean = false;
  public static keyDown: boolean = false;
  public static animationSpeed: number;
  public static pathDelay: number;
  public static isAnimatedCameraToolActive: boolean = false;


  public static ChangeRenderSpeed = (speedAnimation: string) => {
    switch (speedAnimation) {
      case "Slowest":
        AnimatedCameraApp.animationSpeed = 1;
        AnimatedCameraApp.pathDelay = 40;
        break;
      case "Slower":
        AnimatedCameraApp.animationSpeed = 2;
        AnimatedCameraApp.pathDelay = 30;
        break;
      case "Default":
        AnimatedCameraApp.animationSpeed = 3;
        AnimatedCameraApp.pathDelay = 20;
        break;
      case "Faster":
        AnimatedCameraApp.animationSpeed = 4;
        AnimatedCameraApp.pathDelay = 10;
        break;
      case "Fastest":
        AnimatedCameraApp.animationSpeed = 5;
        AnimatedCameraApp.pathDelay = 1;
        break;
    }
  }

  public static ChangeDirectionToggle = (checked: boolean) => {
    if (checked)
      AnimatedCameraApp.isUnlockDirectionOn = true;
    else
      AnimatedCameraApp.isUnlockDirectionOn = false;
  }

  public static ChangeRenderPath = (path: string, currentInitialCoordinate: CameraPoint): CameraPoint[] => {
    AnimatedCameraApp.isInitialPositionStarted = false;
    AnimatedCameraApp.isPaused = true;
    AnimatedCameraApp.countPathTravelled = 0;
    AnimatedCameraApp.isUnlockDirectionOn = false;
    (AnimatedCameraApp.viewport.view as ViewState3d).lookAtUsingLensAngle(currentInitialCoordinate.point, currentInitialCoordinate.direction, new Vector3d(0, 0, 1), (AnimatedCameraApp.viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    AnimatedCameraApp.viewport.synchWithView();
    (AnimatedCameraApp.viewport.view as ViewState3d).setupFromFrustum(AnimatedCameraApp.initialFrustum);
    const cameraPoints: CameraPoint[] = [];
    switch (path) {
      case "TrainPath":
        trainPathCoordinates.forEach((item, index) => {
          if (index !== trainPathCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.00015) {
              cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].cameraPoint.x, trainPathCoordinates[index + 1].cameraPoint.y, trainPathCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].viewDirection.x, trainPathCoordinates[index + 1].viewDirection.y, trainPathCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;

      case "FlyoverPath":
        flyoverCoordinates.forEach((item, index) => {
          if (index !== flyoverCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.0002) {
              cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(flyoverCoordinates[index + 1].cameraPoint.x, flyoverCoordinates[index + 1].cameraPoint.y, flyoverCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(flyoverCoordinates[index + 1].viewDirection.x, flyoverCoordinates[index + 1].viewDirection.y, flyoverCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
        break;

      case "CommuterPath":
        commuterViewCoordinates.forEach((item, index) => {
          if (index !== commuterViewCoordinates.length - 1) {
            for (let j: number = 0.00; j <= 1.0; j = j + 0.0025) {
              cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(commuterViewCoordinates[index + 1].cameraPoint.x, commuterViewCoordinates[index + 1].cameraPoint.y, commuterViewCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(commuterViewCoordinates[index + 1].viewDirection.x, commuterViewCoordinates[index + 1].viewDirection.y, commuterViewCoordinates[index + 1].viewDirection.z)), isTraversed: false });
            }
          }
        });
    }
    (AnimatedCameraApp.viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoints[0].point, cameraPoints[0].direction, new Vector3d(0, 0, 1), (AnimatedCameraApp.viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    AnimatedCameraApp.viewport.synchWithView();
    AnimatedCameraApp.currentFrustum = AnimatedCameraApp.viewport.getFrustum().clone();
    AnimatedCameraApp.initialFrustum = AnimatedCameraApp.viewport.getFrustum().clone();
    AnimatedCameraApp.ToolActivation();
    return cameraPoints;
  }

  public static setupInitialValuesOnIModelReady = (vp: Viewport): CameraPoint[] => {
    AnimatedCameraApp.isInitialPositionStarted = false;
    AnimatedCameraApp.isPaused = false;
    AnimatedCameraApp.countPathTravelled = 0;
    AnimatedCameraApp.animationSpeed = 3;
    AnimatedCameraApp.pathDelay = 20;
    const cameraPoints: CameraPoint[] = [];
    trainPathCoordinates.forEach((item, index) => {
      if (index !== trainPathCoordinates.length - 1) {
        for (let j: number = 0.00; j <= 1.0; j = j + 0.00015) {
          cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].cameraPoint.x, trainPathCoordinates[index + 1].cameraPoint.y, trainPathCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j, new Point3d(trainPathCoordinates[index + 1].viewDirection.x, trainPathCoordinates[index + 1].viewDirection.y, trainPathCoordinates[index + 1].viewDirection.z)), isTraversed: false });
        }
      }
    });
    AnimatedCameraApp.viewport = vp;
    (AnimatedCameraApp.viewport.view as ViewState3d).lookAtUsingLensAngle(new Point3d(trainPathCoordinates[0].cameraPoint.x, trainPathCoordinates[0].cameraPoint.y, trainPathCoordinates[0].cameraPoint.z), new Point3d(trainPathCoordinates[0].viewDirection.x, trainPathCoordinates[0].viewDirection.y, trainPathCoordinates[0].viewDirection.z), new Vector3d(0, 0, 1), (AnimatedCameraApp.viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    AnimatedCameraApp.viewport.synchWithView();
    AnimatedCameraApp.currentFrustum = AnimatedCameraApp.viewport.getFrustum().clone();
    AnimatedCameraApp.initialFrustum = AnimatedCameraApp.viewport.getFrustum().clone();
    return cameraPoints;
  }

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
      if (!AnimatedCameraApp.isPaused) {
        (AnimatedCameraApp.viewport.view as ViewState3d).setupFromFrustum(AnimatedCameraApp.initialFrustum);
        for (const coordinate of pathArray) {
          if (coordinate.isTraversed) {
            (AnimatedCameraApp.viewport.view as ViewState3d).lookAtUsingLensAngle(coordinate.point, coordinate.direction, new Vector3d(0, 0, 1), (AnimatedCameraApp.viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
            AnimatedCameraApp.viewport.synchWithView();
            AnimatedCameraApp.currentFrustum = AnimatedCameraApp.viewport.getFrustum().clone();
          }
          else
            break;
        }
      }
    }
    AnimatedCameraApp.ToolActivation();
  }

  public static ToolActivation() {
    if (!AnimatedCameraApp.isPaused && !AnimatedCameraApp.isAnimatedCameraToolActive) {
      AnimatedCameraApp.isAnimatedCameraToolActive = true;
      IModelApp.tools.run(AnimatedCameraTool.toolId);
    }
    else if ((!AnimatedCameraApp.isInitialPositionStarted || AnimatedCameraApp.isPaused) && AnimatedCameraApp.isAnimatedCameraToolActive) {
      AnimatedCameraApp.isAnimatedCameraToolActive = false;
      IModelApp.tools.run(SelectionTool.toolId); // will stop the AnimatedCameraTool and run the default tool as mentioned here : https://www.itwinjs.org/learning/frontend/tools/#tooladmin
    }
  }

  public static async animateCameraPath(cameraPoint: CameraPoint, pathArray: CameraPoint[]) {
    if (pathArray.indexOf(cameraPoint) % AnimatedCameraApp.animationSpeed === 0) {
      if (!AnimatedCameraApp.isUnlockDirectionOn)
        (AnimatedCameraApp.viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.point, cameraPoint.direction, new Vector3d(0, 0, 1), (AnimatedCameraApp.viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
      else
        (AnimatedCameraApp.viewport.view as ViewState3d).setEyePoint(cameraPoint.point);
      AnimatedCameraApp.viewport.synchWithView();
      await AnimatedCameraApp.delay(AnimatedCameraApp.pathDelay);
    }
    AnimatedCameraApp.currentFrustum = AnimatedCameraApp.viewport.getFrustum().clone();
    cameraPoint.isTraversed = true;
    AnimatedCameraApp.countPathTravelled++;
  }

  public static animateCameraSlider(pathArray: CameraPoint[], sliderValue: string) {
    (AnimatedCameraApp.viewport.view as ViewState3d).lookAtUsingLensAngle(pathArray[0].point, pathArray[0].direction, new Vector3d(0, 0, 1), (AnimatedCameraApp.viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    AnimatedCameraApp.viewport.synchWithView();
    AnimatedCameraApp.isInitialPositionStarted = true;
    (AnimatedCameraApp.viewport.view as ViewState3d).setupFromFrustum(AnimatedCameraApp.initialFrustum);
    for (const coordinate of pathArray) {
      if (pathArray.indexOf(coordinate) <= Number(sliderValue)) {
        if (pathArray.indexOf(coordinate) % 5 === 0 || pathArray.indexOf(coordinate) === Number(sliderValue)) {
          (AnimatedCameraApp.viewport.view as ViewState3d).lookAtUsingLensAngle(coordinate.point, coordinate.direction, new Vector3d(0, 0, 1), (AnimatedCameraApp.viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
          AnimatedCameraApp.viewport.synchWithView();
          AnimatedCameraApp.currentFrustum = AnimatedCameraApp.viewport.getFrustum().clone();
        }
        coordinate.isTraversed = true;
      }
      else
        coordinate.isTraversed = false;
    }
    AnimatedCameraApp.ToolActivation();
  }

  public static async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static teardown() {
    IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
    IModelApp.tools.unRegister(AnimatedCameraTool.toolId);
  }
}

