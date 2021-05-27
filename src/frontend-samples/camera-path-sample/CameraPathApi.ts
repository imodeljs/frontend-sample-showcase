/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { CurveChainWithDistanceIndex, CurveLocationDetail, LineString3d, Path, Point3d, Vector3d } from "@bentley/geometry-core";
import { commuterViewCoordinates, flyoverCoordinates, trainPathCoordinates } from "./Coordinates";

export interface CameraPathPoint {
  eyePoint: Point3d;
  targetPoint: Point3d;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class CameraPathApp {

  public static changeCameraPositionAndTarget(cameraPoint: CameraPathPoint, viewport: Viewport, changeCameraTargetOnly: boolean = false) {
    if (changeCameraTargetOnly){
      (viewport.view as ViewState3d).setEyePoint(cameraPoint.eyePoint);
    } else {
      (viewport.view as ViewState3d).lookAtUsingLensAngle(cameraPoint.eyePoint, cameraPoint.targetPoint, new Vector3d(0, 0, 1), (viewport.view as ViewState3d).camera.lens, undefined, undefined, { animateFrustumChange: true });
    }
    viewport.synchWithView();
  }

  // Turn the viewport camera on
  public static async prepareView( vp: Viewport) {
    vp.turnCameraOn();
    vp.synchWithView();
  }

}

// A CameraPath consists of a CurveChain representing the camera location and an array
// of TargetPoints representing the camera TargetPoint at each point.
export class CameraPath {
  private _path: CurveChainWithDistanceIndex | undefined;
  private _targetPoints: Point3d[] = [];

  // Build a camera path by reading the raw data
  public static createByLoadingFromJson(pathName: string) {  // return the cameraPath object
    const cameraPath = new CameraPath();
    let currentPathCoordinates: typeof trainPathCoordinates = [];
    const targetPoints: Point3d[] = [];
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
      targetPoints.push(new Point3d(item.targetPoint.x, item.targetPoint.y, item.targetPoint.z));
    });
    const line: LineString3d = LineString3d.create();
    currentPathCoordinates.forEach((item) => {
      line.addPoint(new Point3d(item.eyePoint.x, item.eyePoint.y, item.eyePoint.z));
    });
    const path = CurveChainWithDistanceIndex.createCapture(Path.create(line));
    if (path !== undefined) {
      cameraPath._path = path;
      cameraPath._targetPoints = targetPoints;
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

  public getPathPoint(fraction: number) {   // return CameraPoint
    if (!this._path)
      throw new Error("Path was not loaded");

    const eyePoint = this._path.fractionToPoint(fraction);
    const targetPoint = this._getTargetPoint(eyePoint);

    return { eyePoint, targetPoint };
  }

  private _getTargetPoint(point: Point3d) {
    if (!this._path)
      throw new Error("Path was not loaded");

    // Based on the current point, figure out which segment we are on, and how far along that segment.
    const detail = this._path.closestPoint(point, false);
    if (!detail || !detail.childDetail)
      throw new Error("Invalid path");

    const lineString = detail.childDetail.curve as LineString3d;
    const numPoints = lineString.packedPoints.length;
    const { segmentIndex, segmentFraction } = this._getSegmentIndexAndLocalFraction(detail, numPoints);

    // If we are standing on the last point, just return the last point
    if (numPoints - 1 === segmentIndex)
      return new Point3d(this._targetPoints[segmentIndex].x, this._targetPoints[segmentIndex].y, this._targetPoints[segmentIndex].z);

    // We are in between two points of the path, interpolate between the two points
    const prevTargetPoint = this._targetPoints[segmentIndex];
    const nextTargetPoint= this._targetPoints[segmentIndex + 1];
    return prevTargetPoint.interpolate(segmentFraction, nextTargetPoint);
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
