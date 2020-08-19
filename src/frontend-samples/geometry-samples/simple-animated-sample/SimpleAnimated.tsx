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

export default class SimpleAnimated implements SampleApp {

  public static grid: boolean[][] = [];
  public static sampleDimensions = new Range3d(-10, -10, 0, 1010, 1010, 0);

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup(SimpleAnimated.sampleDimensions);
    BlankViewport.decorator = new GeometryDecorator(SimpleAnimated.drawingCallback, true, 100);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    SimpleAnimated.generateGrid();
    return <BlankViewport force2d={true}></BlankViewport>;
  }

  public static teardown() {
    BlankViewport.decorator.toggleAnimation();
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
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
    BlankViewport.decorator.clearGeometry();
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
          BlankViewport.decorator.addGeometry(loop);
        }
      }
    }
    SimpleAnimated.updateGrid();
    IModelApp.viewManager.invalidateDecorationsAllViews();
  }
}
