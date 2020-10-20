/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Arc3d, LineString3d, Loop, Point3d, Point3dArray, Range3d, Transform } from "@bentley/geometry-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { ColorDef } from "@bentley/imodeljs-common";
import Transformations2dUI from "./2dTransformationsUI";

interface TransformationState {
  shape: string;
  color: ColorDef;
  xTrans: number;
  yTrans: number;
  rotationDeg: number;
  geometry: Loop | undefined;
}

export default class Transformations2dApp implements SampleApp {

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup(new Range3d(-500, -500, 0, 500, 500, 0));
    BlankViewport.decorator = new GeometryDecorator(true, 10);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <Transformations2dUI></Transformations2dUI>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public static handleLeftXTranslation(state: TransformationState) {
    if (state.geometry) {
      const newGeometry = state.geometry;
      if (newGeometry)
        if (newGeometry.tryTranslateInPlace(-state.xTrans, 0, 0)) {
          return newGeometry;
        }
    }
  }

  public static handleRightXTranslation(state: TransformationState) {
    if (state.geometry) {
      const newGeometry = state.geometry;
      if (newGeometry)
        if (newGeometry.tryTranslateInPlace(state.xTrans, 0, 0)) {

          return newGeometry;
        }
    }
  }

  public static handleUpYTranslation(state: TransformationState) {
    if (state.geometry) {
      const newGeometry = state.geometry;
      if (newGeometry)
        if (newGeometry.tryTranslateInPlace(0, state.yTrans, 0)) {

          return newGeometry;
        }
    }
  }

  public static handleDownYTranslation(state: TransformationState) {
    if (state.geometry) {
      const newGeometry = state.geometry;
      if (newGeometry)
        if (newGeometry.tryTranslateInPlace(0, -state.yTrans, 0)) {

          return newGeometry;
        }
    }
  }

  public static handleLeftRotation(state: TransformationState) {
    if (state.geometry) {
      const newGeometry = state.geometry;
      if (newGeometry) {
        const radians = state.rotationDeg / 57.2958;
        const rotation = Transform.createRowValues(Math.cos(radians), -Math.sin(radians), 0, 0, Math.sin(radians), Math.cos(radians), 0, 0, 0, 0, 1, 0);
        if (newGeometry.tryTransformInPlace(rotation)) {

          return newGeometry;
        }
      }
    }
  }

  public static handleRightRotation(state: TransformationState) {
    if (state.geometry) {
      const newGeometry = state.geometry;
      if (newGeometry) {
        const radians = -state.rotationDeg / 57.2958;
        const rotation = Transform.createRowValues(Math.cos(radians), -Math.sin(radians), 0, 0, Math.sin(radians), Math.cos(radians), 0, 0, 0, 0, 1, 0);
        if (newGeometry.tryTransformInPlace(rotation)) {

          return newGeometry;
        }
      }
    }
  }

  public static generateBaseGeometry(shape: string) {
    if (shape === "Square") {
      const points: Point3d[] = [];
      points.push(Point3d.create(-200, -200, 0));
      points.push(Point3d.create(-200, 200, 0));
      points.push(Point3d.create(200, 200, 0));
      points.push(Point3d.create(200, -200, 0));
      const linestring = LineString3d.create(points);
      const loop = Loop.create(linestring.clone());
      return loop;

    } else if (shape === "Circle") {
      const circle = Arc3d.createXY(Point3d.create(0, 0, 0), 200);
      const loop = Loop.create(circle.clone());
      return loop;
    } else if (shape === "Triangle") {
      const points: Point3d[] = [];
      points.push(Point3d.create(0, 200, 0));
      points.push(Point3d.create(-250, -100, 0));
      points.push(Point3d.create(250, -100, 0));
      const linestring = LineString3d.create(points);
      const loop = Loop.create(linestring.clone());
      return loop;

    } else if (shape === "Convex Hull") {
      const points: Point3d[] = [];
      points.push(Point3d.create(-400, 0, 0));
      points.push(Point3d.create(-300, 100, 0));
      points.push(Point3d.create(-400, 300, 0));
      points.push(Point3d.create(400, 50, 0));
      points.push(Point3d.create(0, 400, 0));
      points.push(Point3d.create(-500, 200, 0));
      points.push(Point3d.create(-350, 200, 0));
      points.push(Point3d.create(-310, 200, 0));
      points.push(Point3d.create(-320, 200, 0));
      points.push(Point3d.create(-200, 400, 0));
      const hullPoints: Point3d[] = [];
      const interiorPoints: Point3d[] = [];
      Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
      const hullGeometry = LineString3d.create(hullPoints);
      const loop = Loop.create(hullGeometry.clone());
      return loop;
    }
  }

  public static setGeometry(geometry: Loop) {
    BlankViewport.decorator.clearGeometry();
    BlankViewport.decorator.setColor(ColorDef.red);
    BlankViewport.decorator.setLineThickness(5);
    BlankViewport.decorator.addGeometry(geometry);
  }
}
