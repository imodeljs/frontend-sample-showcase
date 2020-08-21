/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { Cone, Point3d, PolyfaceBuilder, StrokeOptions } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
export default class Simple3d implements SampleApp {

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup();
    BlankViewport.decorator = new GeometryDecorator(Simple3d.drawingCallback);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <BlankViewport force2d={false}></BlankViewport>;
  }

  public static teardown() {
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public static drawingCallback() {
    // Make a meshed cone
    const options = new StrokeOptions();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    const cone = Cone.createAxisPoints(Point3d.create(500, 350, 500), Point3d.create(500, 650, 500), 250, 100, true)!;
    builder.addCone(cone);
    const polyface = builder.claimPolyface(true);
    BlankViewport.decorator.setColor(ColorDef.blue);
    //BlankViewport.decorator.setFill(false);
    BlankViewport.decorator.addGeometry(polyface);
  }
}
