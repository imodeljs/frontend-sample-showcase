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
import { Angle, Vector3d } from "@bentley/geometry-core";
import * as data from './Coordinates.json';

export interface AttrValues {
  positionOn: boolean;
  locationOn: boolean;
  isPause: boolean;
}


interface CameraPoint {
  x: number;
  y: number;
  z: number;
  isTraversed: boolean;
}


/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class ViewCameraApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return < ViewCameraUI iModelName={
      iModelName}
      iModelSelector={
        iModelSelector} />;
  }

  public static count: number = 0
  public static isInitialPositionStarted: boolean = false;
  public static isRotationStarted: boolean = false;
  public static isPaused: boolean = false;
  public static degreesRotated: number = 0.0;

  //  Will  Move  All  Arrays  into  a Json  File
  public static cooordinatesArray1: CameraPoint[] = data.cooordinatesArray1;
  public static cooordinatesArray2: CameraPoint[] = data.cooordinatesArray2;
  public static cooordinatesArray3: CameraPoint[] = data.cooordinatesArray3;
  public static cooordinatesArray4: CameraPoint[] = data.cooordinatesArray4;

  public static cooordinatesArray5: CameraPoint[] = data.cooordinatesArray5;
  public static cooordinatesArray6: CameraPoint[] = data.cooordinatesArray6;
  public static cooordinatesArray7: CameraPoint[] = data.cooordinatesArray7;
  public static cooordinatesArray8: CameraPoint[] = data.cooordinatesArray8;
  public static totalArrayLength: number = ViewCameraApp.cooordinatesArray1.length + ViewCameraApp.cooordinatesArray2.length + ViewCameraApp.cooordinatesArray3.length + ViewCameraApp.cooordinatesArray4.length + ViewCameraApp.cooordinatesArray5.length + ViewCameraApp.cooordinatesArray6.length + ViewCameraApp.cooordinatesArray7.length + ViewCameraApp.cooordinatesArray8.length;


  public static getAttrValues(): AttrValues {
    return {
      positionOn: true,
      locationOn: true,
      isPause: false,
    };
  }


  // Modify camera setting using the Viewport API.
  public static async setPlay(vp: Viewport, instance: ViewCameraUI) {
    var i: number = 0;
    (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-0.01), new Vector3d(0, 0, 1));
    ViewCameraApp.degreesRotated += -0.01;

    for (i = 0; i < this.cooordinatesArray1.length; i++) {
      if (this.cooordinatesArray1[i].isTraversed) {
        continue;
      }

      if (ViewCameraApp.isPaused)
        break;

      (vp.view as ViewState3d).setEyePoint({ x: this.cooordinatesArray1[i].x, y: this.cooordinatesArray1[i].y, z: this.cooordinatesArray1[i].z });
      (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-0.01), new Vector3d(0, 0, 1));
      ViewCameraApp.degreesRotated += -0.01;
      vp.synchWithView();
      if (i % 100 == 0) {
        this.count += 100;
        instance.updateTimeline();
      }
      await this.delay(0.00001);
      this.cooordinatesArray1[i].isTraversed = true;
    }

    for (i = 0; i < this.cooordinatesArray2.length; i++) {
      if (this.cooordinatesArray2[i].isTraversed) {
        continue;
      }

      if (ViewCameraApp.isPaused)
        break;

      (vp.view as ViewState3d).setEyePoint({ x: this.cooordinatesArray2[i].x, y: this.cooordinatesArray2[i].y, z: this.cooordinatesArray2[i].z });
      (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-0.02), new Vector3d(0, 0, 1));
      ViewCameraApp.degreesRotated += -0.02;
      vp.synchWithView();
      if (i % 100 == 0) {
        this.count += 100;
        instance.updateTimeline();
      }
      await this.delay(0.00001);
      this.cooordinatesArray2[i].isTraversed = true;
    }

    for (i = 0; i < this.cooordinatesArray3.length; i++) {
      if (this.cooordinatesArray3[i].isTraversed) {
        continue;
      }

      if (ViewCameraApp.isPaused)
        break;

      (vp.view as ViewState3d).setEyePoint({ x: this.cooordinatesArray3[i].x, y: this.cooordinatesArray3[i].y, z: this.cooordinatesArray3[i].z });
      (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-0.09), new Vector3d(0, 0, 1));
      ViewCameraApp.degreesRotated += -0.09;
      vp.synchWithView();
      if (i % 100 == 0) {
        this.count += 100;
        instance.updateTimeline();
      }
      await this.delay(0.0001);
      this.cooordinatesArray3[i].isTraversed = true;
    }
    await this.delay(10);

    for (i = 0; i < this.cooordinatesArray4.length; i++) {
      if (this.cooordinatesArray4[i].isTraversed) {
        continue;
      }

      if (ViewCameraApp.isPaused)
        break;

      (vp.view as ViewState3d).setEyePoint({ x: this.cooordinatesArray4[i].x, y: this.cooordinatesArray4[i].y, z: this.cooordinatesArray4[i].z });
      (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-0.1), new Vector3d(0, 0, 1));
      ViewCameraApp.degreesRotated += -0.1;
      vp.synchWithView();
      if (i % 100 == 0) {
        this.count += 100;
        instance.updateTimeline();
      }
      await this.delay(0.00001);
      this.cooordinatesArray4[i].isTraversed = true;
    }

    for (i = 0; i < this.cooordinatesArray5.length; i++) {
      if (this.cooordinatesArray5[i].isTraversed) {
        continue;
      }

      if (ViewCameraApp.isPaused)
        break;

      (vp.view as ViewState3d).setEyePoint({ x: this.cooordinatesArray5[i].x, y: this.cooordinatesArray5[i].y, z: this.cooordinatesArray5[i].z });
      (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(-0.01), new Vector3d(0, 0, 1));
      ViewCameraApp.degreesRotated += -0.01;
      vp.synchWithView();
      if (i % 100 == 0) {
        this.count += 100;
        instance.updateTimeline();
      }
      await this.delay(0.00001);
      this.cooordinatesArray5[i].isTraversed = true;
    }


    for (i = 0; i < this.cooordinatesArray6.length; i++) {
      if (this.cooordinatesArray6[i].isTraversed) {
        continue;
      }

      if (ViewCameraApp.isPaused)
        break;

      (vp.view as ViewState3d).setEyePoint({ x: this.cooordinatesArray6[i].x, y: this.cooordinatesArray6[i].y, z: this.cooordinatesArray6[i].z });
      (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(0.01), new Vector3d(0, 0, 1));
      ViewCameraApp.degreesRotated += 0.01;
      vp.synchWithView();
      if (i % 100 == 0) {
        this.count += 100;
        instance.updateTimeline();
      }
      await this.delay(0.00001);
      this.cooordinatesArray6[i].isTraversed = true;

    }


    for (i = 0; i < this.cooordinatesArray7.length; i++) {
      if (this.cooordinatesArray7[i].isTraversed) {
        continue;
      }

      if (ViewCameraApp.isPaused)
        break;

      (vp.view as ViewState3d).setEyePoint({ x: this.cooordinatesArray7[i].x, y: this.cooordinatesArray7[i].y, z: this.cooordinatesArray7[i].z });
      //   (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(0.01), new Vector3d(0, 0, 1));
      vp.synchWithView();
      if (i % 100 == 0) {
        this.count += 100;
        instance.updateTimeline();
      }
      await this.delay(0.00001);
      this.cooordinatesArray7[i].isTraversed = true;
    }

    for (i = 0; i < this.cooordinatesArray8.length; i++) {
      if (this.cooordinatesArray8[i].isTraversed) {
        continue;
      }

      if (ViewCameraApp.isPaused)
        break;

      (vp.view as ViewState3d).setEyePoint({ x: this.cooordinatesArray8[i].x, y: this.cooordinatesArray8[i].y, z: this.cooordinatesArray8[i].z });
      //   (vp.view as ViewState3d).rotateCameraWorld(Angle.createDegrees(0.01), new Vector3d(0, 0, 1));
      vp.synchWithView();
      if (i % 100 == 0) {
        this.count += 100;
        instance.updateTimeline();
      }
      await this.delay(0.00001);
      this.cooordinatesArray8[i].isTraversed = true;
    }

    if (!ViewCameraApp.isPaused) {
      ViewCameraApp.isInitialPositionStarted = false;
      this.count = this.cooordinatesArray1.length + this.cooordinatesArray2.length + this.cooordinatesArray3.length + this.cooordinatesArray4.length + this.cooordinatesArray5.length + this.cooordinatesArray6.length + this.cooordinatesArray7.length + this.cooordinatesArray8.length;
      instance.updateTimeline();
    }
  }

  public static async moveCameraPosition(vp: Viewport, value: number, instance: ViewCameraUI) {
    console.log(vp + "" + value + instance);
  }


  public static delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

}

