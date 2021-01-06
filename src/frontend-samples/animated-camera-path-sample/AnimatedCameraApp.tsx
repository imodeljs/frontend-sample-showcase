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

// The level of Animation Speed, will regulate the speed
export enum AnimationSpeed {
  Default = 1,  // Travel all coordinates
  Fast = 3,     // Travel every 3rd coordinate
  Faster,   // Travel every 4th coordinate
  Fastest  // Travel every 5th coordinate
}

// For Delay between two Coordinates while animation is Active
export enum PathDelay {
  Slowest = 30,
  Default = 5,
  Fast = 2,
  Faster = 1,
  Fastest = 0.01
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
      } else
        coordinate.isTraversed = false;
    }
  }

  // load the Coordinates while onIModelReady and changing the Camera Path
  public static loadCameraPath(pathName: string): CameraPoint[] {
    const pathSpeed = 1.4 // The normal human walking Speed is 1.4 meters/second
    const stepsPerSecond = 30; //  In order to know  how much steps it will take to move between successive coordinates,consider camera movement as 30 steps/second and then multiply it by duration to travel between successive coordinates
    let pathDistance: number; // Distance between two Coordinates
    let pathTotalSteps: number;
    const cameraPoints: CameraPoint[] = [];
    const currentPathCoordinates = pathName === "TrainPath" ? trainPathCoordinates : (pathName === "FlyoverPath" ? flyoverCoordinates : commuterViewCoordinates);
    currentPathCoordinates.forEach((item, index) => {
      if (index !== currentPathCoordinates.length - 1) {
        if (pathDistance = new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).distance(new Point3d(currentPathCoordinates[index + 1].cameraPoint.x, currentPathCoordinates[index + 1].cameraPoint.y, currentPathCoordinates[index + 1].cameraPoint.z))) // Two coordinates can be same as a commuter can look around at a particular position
          pathTotalSteps = stepsPerSecond * (pathDistance / pathSpeed);  // stepsPerSecond * Duration to travel between two coordinates with constant speed
        else if (pathDistance = new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).distance(new Point3d(currentPathCoordinates[index + 1].viewDirection.x, currentPathCoordinates[index + 1].viewDirection.y, currentPathCoordinates[index + 1].viewDirection.z)))
          pathTotalSteps = stepsPerSecond * (pathDistance / pathSpeed); // stepsPerSecond * Duration to travel between two ViewDirection coordinates at a particular coordinate with constant speed
        // for each current step calculate the interpolation value by evaluating current step/total no of steps
        for (let j: number = 0; j <= pathTotalSteps; j++) {
          cameraPoints.push({ point: new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z).interpolate(j / pathTotalSteps, new Point3d(currentPathCoordinates[index + 1].cameraPoint.x, currentPathCoordinates[index + 1].cameraPoint.y, currentPathCoordinates[index + 1].cameraPoint.z)), direction: new Point3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z).interpolate(j / pathTotalSteps, new Point3d(currentPathCoordinates[index + 1].viewDirection.x, currentPathCoordinates[index + 1].viewDirection.y, currentPathCoordinates[index + 1].viewDirection.z)), isTraversed: false });
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
    } else if ((!isInitialPositionStarted || isPaused) && AnimatedCameraTool.isAnimatedCameraToolActive) {
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

