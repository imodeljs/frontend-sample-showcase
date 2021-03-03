/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React from "react";
import { Point3d } from "@bentley/geometry-core";
import { Marker, DecorateContext } from "@bentley/imodeljs-frontend";
import {
  Marker as MarkerComponent,
  getSuper,
} from "@bentley/imodel-react-hooks";
import styles from "./ReactMarker.module.scss";

declare namespace ReactMarker {
  export interface Props {
    worldLocation: Point3d;
  }
}

const minWidth = 320;
const minHeight = 180;
const aspectRatio = minWidth / minHeight;
const maxHeight = 360;
const minCameraDistanceScale = 50;
const maxCameraDistanceScale = 500;

function clamp(val: number, min: number, max: number) {
  return Math.min(max, Math.max(val, min));
}

// eslint-disable-next-line no-redeclare
function ReactMarker(props: ReactMarker.Props) {
  const [counter, setCounter] = React.useState(0);

  const [height, setHeight] = React.useState(minHeight);
  const [width, setWidth] = React.useState(minWidth);

  const updateSize = (cameraDistance: number) => {
    const proportion =
      (cameraDistance - minCameraDistanceScale) /
      (maxCameraDistanceScale - minCameraDistanceScale);
    const newHeight = clamp(
      maxHeight - proportion * (maxHeight - minHeight),
      minHeight,
      maxHeight
    );
    setHeight(newHeight);
    setWidth(aspectRatio * height);
  };

  return (
    // to use the Marker component we need an IModelJsViewProvider as an ancestor
    <MarkerComponent
      worldLocation={props.worldLocation}
      size={[490, 265]}
      // pass arbitrary jsx without setting up your own htmlElement
      jsxElement={
        <div className={styles.markerContent}>
          <video controls loop muted width={width} height={height}>
            <source src="/cat_walking.mp4" type="video/mp4" />
            Your browser does not support video tags :(
          </video>
          <button onClick={() => setCounter((prev) => prev + 1)}>+</button>
          <span>{counter}</span>
          <button onClick={() => setCounter((prev) => prev - 1)}>-</button>
        </div>
      }
      addDecoration={function (this: Marker, ctx: DecorateContext) {
        const cameraLoc = ctx.screenViewport.getFrustum().getEyePoint();
        if (cameraLoc) {
          const cameraDistance = cameraLoc.distance(this.worldLocation);
          updateSize(cameraDistance);
          return getSuper(this).addDecoration(ctx);
        }
      }}
    />
  );
}

export default ReactMarker;
