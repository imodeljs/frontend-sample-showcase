/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { Point3d, Range2d } from "@bentley/geometry-core";
/** For the purposes of the frontend samples, we provide three methods to generate
 * a collection of points.  Those are 'random', 'circle', and 'cross'.  This file contains
 * a PointGenerator class for each of those methods.
 */
/** Base class for point generators */
export declare abstract class BasePointGenerator {
    abstract generatePoints(numPoints: number, range: Range2d): Point3d[];
}
/** Create an array of points arranged in a circle */
export declare class CirclePointGenerator extends BasePointGenerator {
    generatePoints(numPoints: number, range: Range2d): Point3d[];
}
/** Create an array of points arranged in an X */
export declare class CrossPointGenerator extends BasePointGenerator {
    private generateFractions;
    generatePoints(numPoints: number, range: Range2d): Point3d[];
}
/** Create an array of points arranged randomly within the range */
export declare class RandomPointGenerator extends BasePointGenerator {
    private _rng;
    constructor();
    generatePoints(numPoints: number, range: Range2d): Point3d[];
}
