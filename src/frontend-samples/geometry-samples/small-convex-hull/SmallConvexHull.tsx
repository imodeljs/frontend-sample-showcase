/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Arc3d, LineString3d, Loop, Point3d, Point3dArray } from "@bentley/geometry-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { ColorDef, TextStringPrimitive, TextString } from "@bentley/imodeljs-common";
export default class SmallConvexHull implements SampleApp {

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup();
    BlankViewport.decorator = new GeometryDecorator(SmallConvexHull.drawingCallback);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <BlankViewport force2d={true}></BlankViewport>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public static drawingCallback() {
    const text: TextStringPrimitive = {
      type: "textString",
      textString: new TextString({
        font: 10,
        height: 10,
        text: "egg",
      }),
    };
    const points: Point3d[] = [];
    points.push(Point3d.create(100, 0, 0));
    points.push(Point3d.create(200, 100, 0));
    points.push(Point3d.create(100, 300, 0));
    points.push(Point3d.create(900, 50, 0));
    points.push(Point3d.create(500, 400, 0));
    points.push(Point3d.create(0, 200, 0));
    points.push(Point3d.create(150, 200, 0));
    points.push(Point3d.create(190, 200, 0));
    points.push(Point3d.create(180, 200, 0));
    points.push(Point3d.create(300, 400, 0));
    const hullPoints: Point3d[] = [];
    const interiorPoints: Point3d[] = [];
    Point3dArray.computeConvexHullXY(points, hullPoints, interiorPoints, true);
    BlankViewport.decorator.setColor(ColorDef.blue);
    //BlankViewport.decorator.setFill(true);
    BlankViewport.decorator.addPoints(interiorPoints);
    BlankViewport.decorator.addText(text);
    const hullGeometry = LineString3d.create(hullPoints);
    BlankViewport.decorator.setColor(ColorDef.green);
    //BlankViewport.decorator.setFill(false);
    BlankViewport.decorator.setLineThickness(5);
    BlankViewport.decorator.addGeometry(hullGeometry);
    const loop = Loop.create(hullGeometry.clone());
    loop.tryTranslateInPlace(0, 500, 0);
    BlankViewport.decorator.setColor(ColorDef.red);
    BlankViewport.decorator.setLineThickness(1);
    BlankViewport.decorator.addGeometry(loop);
    const circle = Arc3d.createXY(Point3d.create(200, 200, 0), 50);
    BlankViewport.decorator.setColor(ColorDef.red);
    BlankViewport.decorator.setFill(true);
    BlankViewport.decorator.addGeometry(circle);
  }
}
