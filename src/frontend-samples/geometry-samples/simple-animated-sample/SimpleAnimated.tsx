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
import { ControlPane } from "Components/ControlPane/ControlPane";
import { Timer } from "@bentley/ui-core";

export default class SimpleAnimated extends React.Component<{}, { grid: boolean[][], dimensions: Range3d, timer: Timer }> implements SampleApp {

  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      grid: this.generateGrid(),
      dimensions: new Range3d(-10, -10, 0, 1010, 1010, 0),
      timer: new Timer(100),

    };
  }

  public static async setup(): Promise<React.ReactNode> {
    await BlankViewport.setup(new Range3d(-10, -10, 0, 1010, 1010, 0));
    BlankViewport.decorator = new GeometryDecorator(true, 100);
    IModelApp.viewManager.addDecorator(BlankViewport.decorator);
    return <SimpleAnimated></SimpleAnimated>;
  }

  public static teardown() {
    if (BlankViewport.decorator)
      BlankViewport.decorator.toggleAnimation();
    if (null != BlankViewport.decorator) {
      IModelApp.viewManager.dropDecorator(BlankViewport.decorator);
    }
  }

  public componentDidMount() {
    this.setGeometry()
    this.state.timer.setOnExecute(this.handleTimer.bind(this));
    this.state.timer.start();

  }

  public componentWillUnmount() {
    this.state.timer.setOnExecute(undefined)
  }

  public generateGrid(size: number = 50, probLife: number = 0.15) {
    const grid: boolean[][] = [];
    for (let i: number = 0; i < size; i++) {
      grid[i] = [];
      for (let j: number = 0; j < size; j++) {
        if (Math.random() < probLife) {
          grid[i][j] = true;
        } else {
          grid[i][j] = false;
        }
      }
    }
    return grid;
  }

  public updateGrid() {
    const tempGrid: boolean[][] = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i: number = 0; i < this.state.grid.length; i++) {
      tempGrid[i] = [];
      for (let j: number = 0; j < this.state.grid[0].length; j++) {
        const numNeighbors = this.getNumNeighbors(i, j);
        if (this.state.grid[i][j]) {
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
    this.setState({
      grid: tempGrid,
    });
  }

  public render() {
    return (
      <>
        <ControlPane instructions="An implementation of Conway's game of life"></ControlPane>
        <BlankViewport force2d={true}></BlankViewport>
      </>
    );
  }

  public getNumNeighbors(i: number, j: number): number {
    let numNeighbors = 0;
    if (i !== 0 && this.state.grid[i - 1][j]) {
      numNeighbors++;
    }
    if (i !== 0 && j !== 0 && this.state.grid[i - 1][j - 1]) {
      numNeighbors++;
    }
    if (j !== 0 && this.state.grid[i][j - 1]) {
      numNeighbors++;
    }
    if (i !== this.state.grid.length - 1 && this.state.grid[i + 1][j]) {
      numNeighbors++;
    }
    if (j !== this.state.grid[0].length - 1 && this.state.grid[i][j + 1]) {
      numNeighbors++;
    }
    if (i !== this.state.grid.length - 1 && j !== this.state.grid[0].length - 1 && this.state.grid[i + 1][j + 1]) {
      numNeighbors++;
    }
    if (i !== this.state.grid.length - 1 && j !== 0 && this.state.grid[i + 1][j - 1]) {
      numNeighbors++;
    }
    if (i !== 0 && j !== this.state.grid[0].length - 1 && this.state.grid[i - 1][j + 1]) {
      numNeighbors++;
    }
    return numNeighbors;
  }

  public setGeometry() {
    BlankViewport.decorator.clearGeometry();
    const squareSize = 20;
    // tslint:disable-next-line: prefer-for-of
    for (let i: number = 0; i < this.state.grid.length; i++) {
      for (let j: number = 0; j < this.state.grid[0].length; j++) {
        if (this.state.grid[i][j]) {
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
    this.updateGrid();
    IModelApp.viewManager.invalidateDecorationsAllViews();
  }

  // We are making use of a timer to consistently render animated geometry
  // Since a viewport only re-renders a frame when it needs or receives new information,
  // We must invalidate the old decorations on every timer tick
  public handleTimer() {
    this.state.timer.start();
    this.setGeometry();
  }

}
