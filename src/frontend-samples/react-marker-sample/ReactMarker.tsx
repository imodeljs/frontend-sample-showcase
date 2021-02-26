/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React from "react";
import { Point3d } from "@bentley/geometry-core";
import { Marker } from "@bentley/imodel-react-hooks";
import styles from "./ReactMarker.module.scss";

declare namespace ReactMarker {
  export interface Props {
    worldLocation: Point3d;
    distanceFromCamera?: number;
  }
}

// eslint-disable-next-line no-redeclare
function ReactMarker(props: ReactMarker.Props) {
  const [counter, setCounter] = React.useState(0);

  const aspectRatio = 4 / 3;
  const minHeight = 100;
  const maxHeight = 200;
  const defaultCameraDistance = 1000;
  const minCameraDistanceScale = 1000;
  const maxCameraDistanceScale = 4000;

  const proportion =
    ((props.distanceFromCamera ?? defaultCameraDistance) -
      minCameraDistanceScale) /
    (maxCameraDistanceScale - minCameraDistanceScale);
  const height = minHeight + proportion * (maxHeight - minHeight);
  const width = aspectRatio * height;

  return (
    // to use the Marker component we need an IModelJsViewProvider as an ancestor
    <Marker
      worldLocation={props.worldLocation}
      size={[490, 265]}
      // pass arbitrary jsx without setting up your own htmlElement
      jsxElement={
        <div className={styles.markerContent} style={{ height, width }}>
          <video controls loop muted>
            <source src="/cat_walking.mp4" type="video/mp4" />
            Your browser does not support video tags :(
          </video>
          <button onClick={() => setCounter((prev) => prev + 1)}>+</button>
          <span>{counter}</span>
          <button onClick={() => setCounter((prev) => prev - 1)}>-</button>
        </div>
      }
    />
  );
}

export default ReactMarker;
