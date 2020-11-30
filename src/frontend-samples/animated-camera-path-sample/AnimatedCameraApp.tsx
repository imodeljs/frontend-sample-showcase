/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import AnimatedCameraUI from "./AnimatedCameraUI";
import SampleApp from "common/SampleApp";
import { Point3d, Vector3d } from "@bentley/geometry-core";
export interface CameraPoint {
  Point: Point3d;
  Direction: Point3d;
  isTraversed: boolean;
}

export interface AttrValues {
  positionOn: boolean;
  locationOn: boolean;
  isPause: boolean;
  sliderValue: number;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class ViewCameraApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return < AnimatedCameraUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static countPathTravelled: number = 0
  public static isInitialPositionStarted: boolean = false;
  public static isPaused: boolean = false;

  //  Move Camera  using the Viewport API.
  public static async animateCameraPath(vp: undefined | Viewport, viewCameraUInstance: AnimatedCameraUI, pathArray: CameraPoint[]) {
    let pathCompleted: boolean = true;
    for (const cameraPoint of pathArray) {
      if (cameraPoint.isTraversed)
        continue;
      if (ViewCameraApp.isPaused) {
        pathCompleted = false;
        break;
      }

      if (vp !== undefined) {
        (vp.view as ViewState3d).lookAt(cameraPoint.Point, cameraPoint.Direction, new Vector3d(0, 0, 1), undefined, undefined, undefined, { animateFrustumChange: true });
        await this.delay(0.001);
        vp.synchWithView();
        cameraPoint.isTraversed = true;
        this.countPathTravelled++;
        viewCameraUInstance.updateTimeline();
      }
    }
    if (pathCompleted) {
      ViewCameraApp.isInitialPositionStarted = false;
    }
    viewCameraUInstance.updateTimeline();
  }


  public static async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

