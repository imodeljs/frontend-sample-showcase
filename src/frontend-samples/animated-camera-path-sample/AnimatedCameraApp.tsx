/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, Viewport } from "@bentley/imodeljs-frontend";
import AnimatedCameraUI from "./AnimatedCameraUI";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import { AnimatedCameraTool } from "./AnimatedCameraTool";
import SampleApp from "common/SampleApp";
import { Point3d } from "@bentley/geometry-core";
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

  public static async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  public static teardown() {
    IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
    IModelApp.tools.unRegister(AnimatedCameraTool.toolId);
  }
}

