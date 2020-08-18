/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { LineSegment3d, Point3d, Point3dArray, Box, Vector3d, StrokeOptions, PolyfaceBuilder, Cone } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
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
    // Make a meshed cone . ..
    const options = new StrokeOptions();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    const cone = Cone.createAxisPoints(Point3d.create(0, 0, 0), Point3d.create(0, 100, 0), 100, 50, true)!;
    builder.addCone(cone);
    const polyface = builder.claimPolyface(true);
    Simple3d.decorator.addGeometry(polyface);
  }
}
