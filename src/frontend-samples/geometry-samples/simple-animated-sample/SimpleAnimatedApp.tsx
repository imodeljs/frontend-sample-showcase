/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { LineString3d, Loop, Point3d, Range3d } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
import SimpleAnimatedUI from "./SimpleAnimatedUI";

export default class SimpleAnimatedApp implements SampleApp {

  public static createGridSquares(grid: boolean[][]) {
    const squares: Loop[] = [];
    const squareSize = 20;
    // tslint:disable-next-line: prefer-for-of
    for (let i: number = 0; i < grid.length; i++) {
      for (let j: number = 0; j < grid[0].length; j++) {
        if (grid[i][j]) {
          const corners: Point3d[] = [];
          corners.push(Point3d.create(i * squareSize, j * squareSize, 0));
          corners.push(Point3d.create(i * squareSize + squareSize, j * squareSize, 0));
          corners.push(Point3d.create(i * squareSize + squareSize, j * squareSize + squareSize, 0));
          corners.push(Point3d.create(i * squareSize, j * squareSize + squareSize, 0));
          const square = LineString3d.create(corners);
          const loop = Loop.create(square.clone());
          squares.push(loop);
        }
      }
    }
    return squares;
  }

  public static async setup(): Promise<React.ReactNode> {
    const decorator = new GeometryDecorator();
    IModelApp.viewManager.addDecorator(decorator);
    return <SimpleAnimatedUI decorator={decorator}></SimpleAnimatedUI>;
  }


}
