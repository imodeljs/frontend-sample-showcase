/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import SampleApp from "common/SampleApp";
import { BlankViewport } from "common/GeometryCommon/BlankViewport";
import { LineSegment3d, Point3d, LineString3d, Loop } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/GeometryCommon/GeometryDecorator";
import { IModelApp } from "@bentley/imodeljs-frontend";
export default class SimpleAnimated implements SampleApp {

  public static decorator: GeometryDecorator;
  public static grid: boolean[][] = [];

  public static async setup(iModelName: string): Promise<React.ReactNode> {
    SimpleAnimated.decorator = new GeometryDecorator(SimpleAnimated.drawingCallback, true);
    IModelApp.viewManager.addDecorator(SimpleAnimated.decorator);
    SimpleAnimated.generateGrid();
    return <BlankViewport force2d={true}></BlankViewport>;
  }

  public static teardown() {
    if (null != SimpleAnimated.decorator) {
      IModelApp.viewManager.dropDecorator(SimpleAnimated.decorator);
    }
  }

  public static generateGrid(size: number = 50, probLife: number = 0.15) {
    for (let i: number = 0; i < size; i++) {
      SimpleAnimated.grid[i] = [];
      for (let j: number = 0; j < size; j++) {
        if (Math.random() < probLife) {
          SimpleAnimated.grid[i][j] = true;
        } else {
          SimpleAnimated.grid[i][j] = false;
        }
      }
    }
  }

  public static updateGrid() {
    const tempGrid: boolean[][] = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i: number = 0; i < SimpleAnimated.grid.length; i++) {
      tempGrid[i] = [];
      for (let j: number = 0; j < SimpleAnimated.grid[0].length; j++) {
        const numNeighbors = this.getNumNeighbors(i, j);
        if (SimpleAnimated.grid[i][j]) {
          if (numNeighbors < 2 || numNeighbors > 3) {
            tempGrid[i][j] = false;
          } else {
            tempGrid[i][j] = true;
          }
        } else {
          if (numNeighbors === 3) {
            tempGrid[i][j] = true;
          } else {
            tempGrid[i][j] = false;
          }
        }
      }
    }
    SimpleAnimated.grid = tempGrid;
  }

  public static getNumNeighbors(i: number, j: number): number {
    let numNeighbors = 0;
    if (i !== 0 && SimpleAnimated.grid[i - 1][j]) {
      numNeighbors++;
    }
    if (i !== 0 && j !== 0 && SimpleAnimated.grid[i - 1][j - 1]) {
      numNeighbors++;
    }
    if (j !== 0 && SimpleAnimated.grid[i][j - 1]) {
      numNeighbors++;
    }
    if (i !== SimpleAnimated.grid.length - 1 && SimpleAnimated.grid[i + 1][j]) {
      numNeighbors++;
    }
    if (j !== SimpleAnimated.grid[0].length - 1 && SimpleAnimated.grid[i][j + 1]) {
      numNeighbors++;
    }
    if (i !== SimpleAnimated.grid.length - 1 && j !== SimpleAnimated.grid[0].length - 1 && SimpleAnimated.grid[i + 1][j + 1]) {
      numNeighbors++;
    }
    if (i !== SimpleAnimated.grid.length - 1 && j !== 0 && SimpleAnimated.grid[i + 1][j - 1]) {
      numNeighbors++;
    }
    if (i !== 0 && j !== SimpleAnimated.grid[0].length - 1 && SimpleAnimated.grid[i - 1][j + 1]) {
      numNeighbors++;
    }
    return numNeighbors;
  }

  public static drawingCallback() {
    SimpleAnimated.decorator.clearGeometry();
    const squareSize = 20;
    // tslint:disable-next-line: prefer-for-of
    for (let i: number = 0; i < SimpleAnimated.grid.length; i++) {
      for (let j: number = 0; j < SimpleAnimated.grid[0].length; j++) {
        if (SimpleAnimated.grid[i][j]) {
          const corners: Point3d[] = [];
          corners.push(Point3d.create(i * squareSize, j * squareSize, 0));
          corners.push(Point3d.create(i * squareSize + squareSize, j * squareSize, 0));
          corners.push(Point3d.create(i * squareSize + squareSize, j * squareSize + squareSize, 0));
          corners.push(Point3d.create(i * squareSize, j * squareSize + squareSize, 0));
          const square = LineString3d.create(corners);
          const loop = Loop.create(square.clone());
          SimpleAnimated.decorator.addGeometry(loop);
        }
      }
    }
    SimpleAnimated.updateGrid();
  }
}
