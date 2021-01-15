/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import CameraPathUI from "./CameraPathUI";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { CameraPathTool } from "./CameraPathTool";
import SampleApp from "common/SampleApp";
import { Angle, Point3d, Vector3d } from "@bentley/geometry-core";
import { commuterViewCoordinates, flyoverCoordinates, trainPathCoordinates } from "./Coordinates";

export interface CameraPoint {
  point: Point3d;
  direction: Vector3d;
}

// The level of Coordinate Traversal Frequency, will regulate the speed at different Levels
export enum CoordinateTraversalFrequency {
  Default = 1,  // Travel all coordinates
  Fast = 3,     // Travel every 3rd coordinate
  Faster,   // Travel every 4th coordinate
  Fastest  // Travel every 5th coordinate
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */// //
export default class CameraPathApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    CameraPathTool.register(this._sampleNamespace);
    return <CameraPathUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static async animateCameraPath(cameraPoint: CameraPoint, cameraPointIndex: number, coordinateTraversingFrequency: number, pathDelay: number, countPathTravelled: number, viewport: Viewport) {
    if (cameraPointIndex % coordinateTraversingFrequency === 0) {
      if (!CameraPathTool.keyDown)
        (viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.point, cameraPoint.direction.cloneAsPoint3d(), new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
      else
        (viewport.view as ViewState3d).setEyePoint(cameraPoint.point);
      viewport.synchWithView();
      await CameraPathApp.delay(pathDelay);
    }
    return ++countPathTravelled;
  }

  public static setViewFromPointAndDirection(cameraPoint: CameraPoint, viewport: Viewport) {
    (viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.point, cameraPoint.direction.cloneAsPoint3d(), new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    viewport.synchWithView();
  }

  // load the Coordinates while onIModelReady and changing the Camera Path
  public static loadCameraPath(pathName: string, pathSpeed: number): CameraPoint[] {
    const pathAngularSpeed: number = 7  // degrees/second  assumed for computing the interpolation fraction for the special case where the camera is rotating from a stationary position
    const stepsPerSecond = 30; //  In order to know  how much steps it will take to move between successive coordinates,consider 30 steps/second and then multiply it by duration to travel between successive coordinates
    let segmentDistance: number; // Distance between two Coordinates
    let segmentAngularDistance: Angle; // Angular Distance between two Direction Vectors
    let segmentStepsCount: number;  // Total Steps count in each Segment
    const cameraPoints: CameraPoint[] = [];
    let currentPathCoordinates: typeof trainPathCoordinates = [];
    switch (pathName) {
      case "TrainPath":
        currentPathCoordinates = trainPathCoordinates;
        break;

      case "FlyoverPath":
        currentPathCoordinates = flyoverCoordinates;
        break;

      case "CommuterPath":
        currentPathCoordinates = commuterViewCoordinates;
    }

    currentPathCoordinates.forEach((item, index) => {
      if (index !== currentPathCoordinates.length - 1) {
        const currPoint = new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z);
        const nextPoint = new Point3d(currentPathCoordinates[index + 1].cameraPoint.x, currentPathCoordinates[index + 1].cameraPoint.y, currentPathCoordinates[index + 1].cameraPoint.z);
        segmentDistance = currPoint.distance(nextPoint);
        if (0 !== segmentDistance)
          segmentStepsCount = stepsPerSecond * (segmentDistance / pathSpeed);  // stepsPerSecond * Duration to travel between two coordinates
        else {
          const currViewDirection = new Vector3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z);
          const nextViewDirection = new Vector3d(currentPathCoordinates[index + 1].viewDirection.x, currentPathCoordinates[index + 1].viewDirection.y, currentPathCoordinates[index + 1].viewDirection.z);
          segmentAngularDistance = currViewDirection.angleTo(nextViewDirection);
          if (0 !== segmentAngularDistance.degrees)
            segmentStepsCount = stepsPerSecond * (segmentAngularDistance.degrees / pathAngularSpeed);
        }

        // for each current step calculate the interpolation value by evaluating current step/total no of steps
        for (let j: number = 0; j <= segmentStepsCount; j++) {
          const currentCoordinate = new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z);
          const nextCoordinate = new Point3d(currentPathCoordinates[index + 1].cameraPoint.x, currentPathCoordinates[index + 1].cameraPoint.y, currentPathCoordinates[index + 1].cameraPoint.z);
          const cameraPoint = currentCoordinate.interpolate(j / segmentStepsCount, nextCoordinate);
          const currentDirectionVector = new Vector3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z);
          const nextDirectionVector = new Vector3d(currentPathCoordinates[index + 1].viewDirection.x, currentPathCoordinates[index + 1].viewDirection.y, currentPathCoordinates[index + 1].viewDirection.z);
          const cameraDirectionVector = currentDirectionVector.interpolate(j / segmentStepsCount, nextDirectionVector);
          cameraPoints.push({ point: cameraPoint, direction: cameraDirectionVector });
        }
      }
    });
    return cameraPoints;
  }

  // We will use this method to activate the CameraPathTool
  // The CameraPathTool will prevent the view tool and standard mouse events
  public static toolActivation() {
    IModelApp.tools.run(CameraPathTool.toolId);
  }

  // For Delay between two Coordinates while animation is Active
  public static async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static teardown() {
    IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
    IModelApp.tools.unRegister(CameraPathTool.toolId);
  }
}

