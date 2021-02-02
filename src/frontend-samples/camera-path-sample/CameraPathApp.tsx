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
import { CurveChainWithDistanceIndex, LineString3d, Path, Point3d, Vector3d } from "@bentley/geometry-core";
import { commuterViewCoordinates, flyoverCoordinates, trainPathCoordinates } from "./Coordinates";

export interface CameraPoint {
  point: Point3d;
  direction: Vector3d;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */// //
export default class CameraPathApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    CameraPathTool.register(this._sampleNamespace);
    return <CameraPathUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static async animateCameraPath(cameraPoint: CameraPoint, viewport: Viewport) {
    if (!CameraPathTool.keyDown)
      (viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.point, cameraPoint.direction.cloneAsPoint3d(), new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    else
      (viewport.view as ViewState3d).setEyePoint(cameraPoint.point);
    viewport.synchWithView();
    await CameraPathApp.delay();
  }

  public static setViewFromPointAndDirection(cameraPoint: CameraPoint, viewport: Viewport) {
    (viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.point, cameraPoint.direction.cloneAsPoint3d(), new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    viewport.synchWithView();
  }

  public static getPointAndDirectionFromPathFraction(path: CurveChainWithDistanceIndex, directions: Vector3d[], pathFraction: number): CameraPoint {
    const cameraPoint = path.fractionToPoint(pathFraction);
    const detail = path.closestPoint(cameraPoint, false);
    let segmentFraction: number = 0;
    let segmentIndex: number = 0;
    let numPoints: number = 0;
    let viewDirection: Vector3d = new Vector3d();
    if (detail && detail?.childDetail) {
      const lineString = detail?.childDetail?.curve as LineString3d;
      numPoints = lineString.packedPoints.length;
      const scaledFraction = detail?.childDetail.fraction * (numPoints - 1);
      segmentIndex = Math.floor(scaledFraction);
      segmentFraction = scaledFraction - segmentIndex;
    }
    const currentDirection = directions[segmentIndex];
    const nextDirection = directions[segmentIndex + 1];
    if (segmentIndex !== numPoints - 1)
      viewDirection = currentDirection.interpolate(segmentFraction, nextDirection);
    else
      viewDirection = new Vector3d(directions[segmentIndex].x, directions[segmentIndex].y, directions[segmentIndex].z);
    return { point: cameraPoint, direction: viewDirection };
  }

  // load the Coordinates while onIModelReady and changing the Camera Path
  public static loadCameraPath(pathName: string): { curveChainWithDistanceIndexPath: CurveChainWithDistanceIndex | undefined, cameraDirection: Vector3d[] } {
    let currentPathCoordinates: typeof trainPathCoordinates = [];
    const direction: Vector3d[] = [];
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
    currentPathCoordinates.forEach((item) => {
      direction.push(new Vector3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z));
    });
    const line: LineString3d = LineString3d.create();
    currentPathCoordinates.forEach((item) => {
      line.addPoint(new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z));
    });
    const path = Path.create(line);
    return { curveChainWithDistanceIndexPath: CurveChainWithDistanceIndex.createCapture(path), cameraDirection: direction };
  }

  // For Delay between two Coordinates while animation is Active
  public static async delay() {
    return new Promise((resolve) => setTimeout(resolve, Math.pow(10, -4)));
  }

  public static teardown() {
    IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
    IModelApp.tools.unRegister(CameraPathTool.toolId);
  }
}

