/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import ViewCameraUI from "./ViewCameraUI";
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
}


/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class ViewCameraApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return < ViewCameraUI iModelName={
      iModelName}
      iModelSelector={
        iModelSelector} />;
  }

  public static countPathTravelled: number = 0
  public static isInitialPositionStarted: boolean = false;
  public static isPaused: boolean = false;



  //  Move Camera  using the Viewport API. 
  public static async animateCameraPath(vp: Viewport, viewCameraUIinstance: ViewCameraUI, pathArray: CameraPoint[]) {
    var pathCompleted: boolean = true;
    for (let i: number = 0; i < pathArray.length; i++) {
      if (pathArray[i].isTraversed)
        continue;
      if (ViewCameraApp.isPaused) {
        pathCompleted = false;
        break;
      }
      (vp.view as ViewState3d).lookAt(pathArray[i].Point, pathArray[i].Direction, new Vector3d(0, 0, 1), undefined, undefined, undefined, { animateFrustumChange: true });
      await this.delay(0.001);
      vp.synchWithView();
      pathArray[i].isTraversed = true;
      if (++this.countPathTravelled % 100 == 0)
        viewCameraUIinstance.updateTimeline();
    }
    if (pathCompleted) {
      ViewCameraApp.isInitialPositionStarted = false;
    }
    viewCameraUIinstance.updateTimeline();
  }

  public static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

