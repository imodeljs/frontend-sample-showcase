/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import AnimatedCameraUI from "./AnimatedCameraUI";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { AnimatedCameraTool } from "./AnimatedCameraTool";
import SampleApp from "common/SampleApp";
import { Point3d, Vector3d } from "@bentley/geometry-core";
import { Frustum } from "@bentley/imodeljs-common";
export interface CameraPoint {
  Point: Point3d;
  Direction: Point3d;
  isTraversed: boolean;
}
export interface AttrValues {
  isPause: boolean;
  sliderValue: number;
  isUnlockDirectionOn: boolean;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class ViewCameraApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    AnimatedCameraTool.register(this._sampleNamespace);
    return < AnimatedCameraUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }
  private static _sampleNamespace: I18NNamespace;
  public static countPathTravelled: number = 0
  public static isInitialPositionStarted: boolean = false;
  public static isPaused: boolean = false;

  public static currentFrustum: Frustum;
  public static InitialFrustum: Frustum;
  public static vp: Viewport;
  public static isUnlockDirectionOn: boolean = false;
  public static keyDown: boolean = false;
  public static Speed: number = 1;

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
        if (pathArray.indexOf(cameraPoint) % ViewCameraApp.Speed === 0) {
          if (!ViewCameraApp.isUnlockDirectionOn) {
            (vp.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.Point, cameraPoint.Direction, new Vector3d(0, 0, 1), (vp.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
          }
          else {
            (vp.view as ViewState3d).setEyePoint(cameraPoint.Point);
          }
          vp.synchWithView();
          await this.delay(29);
        }
        ViewCameraApp.currentFrustum = vp?.getFrustum().clone();
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

  public static teardown() {
    IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
    IModelApp.tools.unRegister(AnimatedCameraTool.toolId);
  }

}

