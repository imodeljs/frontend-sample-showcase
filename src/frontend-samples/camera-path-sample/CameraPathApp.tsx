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
import { CurveChainWithDistanceIndex, CurveLocationDetail, LineString3d, Path, Point3d, Vector3d } from "@bentley/geometry-core";
import { commuterViewCoordinates, flyoverCoordinates, trainPathCoordinates } from "./Coordinates";

export interface CameraPoint {
  point: Point3d;
  direction: Vector3d;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class CameraPathApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    CameraPathTool.register(this._sampleNamespace);
    return <CameraPathUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static async animateCameraPath(cameraPoint: CameraPoint, viewport: Viewport, keyDown: boolean) {
    if (!keyDown)
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

  // For Delay between two Coordinates while animation is Active
  public static async delay() {
    return new Promise((resolve) => setTimeout(resolve, Math.pow(10, -4)));
  }

  public static teardown() {
    IModelApp.i18n.unregisterNamespace("camera-i18n-namespace");
    IModelApp.tools.unRegister(CameraPathTool.toolId);
  }
}

// A CameraPath consists of a CurveChain representing the camera location and an array
// of direction vectors representing the camera direction at each point.
export class CameraPath {
  private _path: CurveChainWithDistanceIndex | undefined;
  private _directions: Vector3d[] = [];

  // Build a camera path by reading the raw data
  public static createByLoadingFromJson(pathName: string) {  // return the cameraPath object
    const cameraPath = new CameraPath();
    let currentPathCoordinates: typeof trainPathCoordinates = [];
    const directions: Vector3d[] = [];
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
      directions.push(new Vector3d(item.viewDirection.x, item.viewDirection.y, item.viewDirection.z));
    });
    const line: LineString3d = LineString3d.create();
    currentPathCoordinates.forEach((item) => {
      line.addPoint(new Point3d(item.cameraPoint.x, item.cameraPoint.y, item.cameraPoint.z));
    });
    const path = CurveChainWithDistanceIndex.createCapture(Path.create(line));
    if (path !== undefined) {
      cameraPath._path = path;
      cameraPath._directions = directions;
    }
    return cameraPath;
  }

  public getLength() {
    if (!this._path)
      throw new Error("Path was not loaded");

    return this._path.curveLength();
  }

  public advanceAlongPath(currentFraction: number, distanceInMeters: number) {  // return the new fraction
    let globalFractionOfPathTravelled: number = 0;
    if (this._path)
      globalFractionOfPathTravelled = this._path.moveSignedDistanceFromFraction(currentFraction, distanceInMeters, false).fraction;
    return globalFractionOfPathTravelled;
  }

  public getPointAndDirection(fraction: number) {   // return CameraPoint
    if (!this._path)
      throw new Error("Path was not loaded");

    const point = this._path.fractionToPoint(fraction);
    const direction = this._getDirection(point);

    return { point, direction };
  }

  private _getDirection(point: Point3d) {
    if (!this._path)
      throw new Error("Path was not loaded");

    // Based on the current point, figure out which segment we are on, and how far along that segment.
    const detail = this._path.closestPoint(point, false);
    if (!detail || !detail.childDetail)
      throw new Error("Invalid path");

    const lineString = detail.childDetail.curve as LineString3d;
    const numPoints = lineString.packedPoints.length;
    const { segmentIndex, segmentFraction } = this._getSegmentIndexAndLocalFraction(detail, numPoints);

    // If we are standing on the last point, just return the last direction
    if (numPoints - 1 === segmentIndex)
      return new Vector3d(this._directions[segmentIndex].x, this._directions[segmentIndex].y, this._directions[segmentIndex].z);

    // We are in between two points of the path, interpolate between the two directions
    const prevDirection = this._directions[segmentIndex];
    const nextDirection = this._directions[segmentIndex + 1];
    return prevDirection.interpolate(segmentFraction, nextDirection);
  }

  private _getSegmentIndexAndLocalFraction(detail: CurveLocationDetail, numPoints: number) {
    let segmentIndex: number = 0;
    let segmentFraction: number = 0;
    if (detail.childDetail) {
      const scaledFraction = detail.childDetail.fraction * (numPoints - 1);
      segmentIndex = Math.floor(scaledFraction);
      segmentFraction = scaledFraction - segmentIndex;
    }
    return { segmentIndex, segmentFraction };
  }
}
