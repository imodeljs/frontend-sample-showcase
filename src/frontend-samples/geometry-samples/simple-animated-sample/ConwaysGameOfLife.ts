/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
export class ConwaysHelpers {

  public static generateGrid(size: number = 50, probLife: number = 0.15) {
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

  // START CONWAYSGAMEOFLIFE
  public static updateGrid(grid: boolean[][]) {
    const tempGrid: boolean[][] = [];
    // tslint:disable-next-line: prefer-for-of
    for (let i: number = 0; i < grid.length; i++) {
      tempGrid[i] = [];
      for (let j: number = 0; j < grid[0].length; j++) {
        const numNeighbors = ConwaysHelpers.getNumNeighbors(i, j, grid);
        if (grid[i][j]) {
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
    return tempGrid;
  }
  // END CONWAYSGAMEOFLIFE


  public static getNumNeighbors(i: number, j: number, grid: boolean[][]): number {
    let numNeighbors = 0;
    if (i !== 0 && grid[i - 1][j]) {
      numNeighbors++;
    }
    if (i !== 0 && j !== 0 && grid[i - 1][j - 1]) {
      numNeighbors++;
    }
    if (j !== 0 && grid[i][j - 1]) {
      numNeighbors++;
    }
    if (i !== grid.length - 1 && grid[i + 1][j]) {
      numNeighbors++;
    }
    if (j !== grid[0].length - 1 && grid[i][j + 1]) {
      numNeighbors++;
    }
    if (i !== grid.length - 1 && j !== grid[0].length - 1 && grid[i + 1][j + 1]) {
      numNeighbors++;
    }
    if (i !== grid.length - 1 && j !== 0 && grid[i + 1][j - 1]) {
      numNeighbors++;
    }
    if (i !== 0 && j !== grid[0].length - 1 && grid[i - 1][j + 1]) {
      numNeighbors++;
    }
    return numNeighbors;
  }
}
