/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { LineString3d, Loop, Point3d } from "@bentley/geometry-core";

export default class SimpleAnimatedApi {

  // START SQUAREGRID
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
  // END SQUAREGRID

}
