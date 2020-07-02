/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Point3d, Range2d } from "@bentley/geometry-core";
import { BasePointGenerator } from "./PointGenerators";
export declare enum PointMode {
    Random = "1",
    Circle = "2",
    Cross = "3"
}
/** React state of the PointSelector component */
export interface PointSelectorProps {
    onPointsChanged(points: Point3d[]): void;
    range?: Range2d;
}
/** React state of the PointSelector */
export interface PointSelectorState {
    pointGenerator: BasePointGenerator;
    pointCount: number;
}
/** A component that renders a point mode selector and a point count range input. */
export declare class PointSelector extends React.Component<PointSelectorProps, PointSelectorState> {
    /** Creates a PointSelector instance */
    constructor(props?: any, context?: any);
    getPoints(): Point3d[];
    private notifyChange;
    private _onChangePointMode;
    private _onChangePointCount;
    componentDidMount(): void;
    componentDidUpdate(prevProps: PointSelectorProps): void;
    /** The component's render method */
    render(): JSX.Element;
}
