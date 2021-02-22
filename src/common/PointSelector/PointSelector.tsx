/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { Point3d, Range2d } from "@bentley/geometry-core";
import { BasePointGenerator, CirclePointGenerator, CrossPointGenerator, RandomPointGenerator } from "./PointGenerators";
import { Select, Slider } from "@bentley/ui-core";

export enum PointMode {
  Random = "1",
  Circle = "2",
  Cross = "3",
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
export class PointSelector extends React.Component<PointSelectorProps, PointSelectorState> {

  /** Creates a PointSelector instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      pointGenerator: new RandomPointGenerator(),
      pointCount: 10,
    };
  }

  public getPoints(): Point3d[] {
    if (undefined === this.props.range)
      return [];

    return this.state.pointGenerator.generatePoints(this.state.pointCount, this.props.range);
  }

  private notifyChange(): void {
    if (undefined === this.props.range)
      return;

    this.props.onPointsChanged(this.getPoints());
  }

  private _onChangePointMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    let pointGenerator: BasePointGenerator;

    switch (event.target.value) {
      case PointMode.Circle: { pointGenerator = new CirclePointGenerator(); break; }
      case PointMode.Cross: { pointGenerator = new CrossPointGenerator(); break; }
      default:
      case PointMode.Random: { pointGenerator = new RandomPointGenerator(); break; }
    }

    this.setState({ pointGenerator });
  }

  private _onChangePointCount = (values: readonly number[]) => {
    this.setState({ pointCount: values[0] });
  }

  public componentDidMount() {
    this.notifyChange();
  }

  public componentDidUpdate(prevProps: PointSelectorProps, prevState: PointSelectorState) {
    if (undefined !== this.props.range && (this.props.range !== prevProps.range ||
      prevState.pointCount !== this.state.pointCount ||
      prevState.pointGenerator !== this.state.pointGenerator)) {
      this.notifyChange();
    }
  }

  /** The component's render method */
  public render() {
    return (
      <>
        <span>Points</span>
        <Select onChange={this._onChangePointMode} options={{ [PointMode.Random]: "Random", [PointMode.Circle]: "Circle", [PointMode.Cross]: "Cross" }} />
        <span>Point Count</span>
        <Slider min={0} max={500} values={[this.state.pointCount]} step={1} onUpdate={this._onChangePointCount} />
      </>
    );
  }
}
