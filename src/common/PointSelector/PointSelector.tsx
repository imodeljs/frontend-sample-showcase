/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Point3d, Range2d } from "@itwin/core-geometry";
import { BasePointGenerator, CirclePointGenerator, CrossPointGenerator, RandomPointGenerator } from "./PointGenerators";
import { Select, Slider } from "@itwin/itwinui-react";

export enum PointMode {
  Random,
  Circle,
  Cross,
}

/** React state of the PointSelector component */
export interface PointSelectorProps {
  disabled?: boolean;
  range?: Range2d;
  onPointsChanged(points: Point3d[]): void;
}

/** A component that renders a point mode selector and a point count range input. */
export const PointSelector: FunctionComponent<PointSelectorProps> = ({ onPointsChanged, range, disabled }) => {
  const [pointMode, setPointMode] = useState<PointMode>(PointMode.Random);
  const [pointCount, setPointCount] = useState<number>(10);
  const pointGenerator = useRef<BasePointGenerator>(new RandomPointGenerator());

  useEffect(() => {
    const points = !!range ? pointGenerator.current.generatePoints(pointCount, range) : [];
    onPointsChanged(points);
  }, [pointMode, pointCount, range, onPointsChanged]);

  const onChangePointCount = useCallback(([newPointCount]: readonly number[]) => {
    setPointCount(newPointCount);
  }, []);

  const onChangePointMode = useCallback((mode: PointMode) => {
    setPointMode((prev) => {
      if (prev !== mode) {
        switch (mode) {
          case PointMode.Circle: { pointGenerator.current = new CirclePointGenerator(); break; }
          case PointMode.Cross: { pointGenerator.current = new CrossPointGenerator(); break; }
          default:
          case PointMode.Random: { pointGenerator.current = new RandomPointGenerator(); break; }
        }
        return mode;
      }
      return prev;
    });
  }, []);

  const sliderValues = useMemo(() => [pointCount], [pointCount]);
  const selectOptions = useMemo(() => [{ value: PointMode.Random, label: "Random" }, { value: PointMode.Circle, label: "Circle" }, { value: PointMode.Cross, label: "Cross" }], []);

  /** The component's render */
  return (
    <>
      <span>Points</span>
      <Select<PointMode> value={pointMode} onChange={onChangePointMode} options={selectOptions} disabled={disabled} />
      <span>Point Count</span>
      <Slider min={0} max={500} values={sliderValues} step={1} onChange={onChangePointCount} onUpdate={onChangePointCount} disabled={disabled} />
    </>
  );
};
