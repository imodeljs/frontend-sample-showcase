/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "../GeometryCommon/BlankViewport";
import { LineSegment3d, Point3d, Point3dArray, Box, Vector3d } from "@bentley/geometry-core";
import { GeometryDecorator } from "../GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
export default class Simple3d implements SampleApp {

  public static decorator: GeometryDecorator;

  public static async setup(iModelName: string): Promise<React.ReactNode> {
    Simple3d.decorator = new GeometryDecorator(Simple3d.drawingCallback);
    IModelApp.viewManager.addDecorator(Simple3d.decorator);
    return <BlankViewport force2d={false}></BlankViewport>;
  }

  public static teardown() {
    if (null != Simple3d.decorator) {
      IModelApp.viewManager.dropDecorator(Simple3d.decorator);
    }
  }

  public static drawingCallback() {
    const baseOrigin = Point3d.create(-100, -100, -100);
    const topOrigin = Point3d.create(100, 100, 100)
    const vectorX = Vector3d.create(100, 100, 100)
    const vectorY = Vector3d.create(100, 100, 100)
    const box = Box.createDgnBox(baseOrigin, vectorX, vectorY, topOrigin, 100, 100, 100, 100, false)
    if (box) {
      Simple3d.decorator.addGeometry(box);
    }
  }
}
