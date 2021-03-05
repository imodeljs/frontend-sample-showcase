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
import styles from "./HtmlMarker.module.scss";
import { HtmlContentMode } from "./HtmlMarkerUI";
import { HtmlMarkerWrapper, clamp } from "./utils";

declare namespace HtmlMarker {
  export interface Props {
    worldLocation: Point3d;
    htmlContentMode: HtmlContentMode;
  }
}

const minWidth = 320 / 3;
const minHeight = 180 / 3;
const aspectRatio = minWidth / minHeight;
const maxHeight = 360;
const minCameraDistanceScale = 50;
const maxCameraDistanceScale = 500;

interface ContentProps {
  width: number;
  height: number;
}

/** the jsx to render when in video content mode */
function VideoContent(props: ContentProps) {
  return (
    <video controls loop muted width={props.width}>
      <source src="/cat_walking.mp4" type="video/mp4" />
      Your browser does not support video tags :(
    </video>
  );
}

/** the jsx to render when in image content mode */
function ImageContent(props: ContentProps) {
  return <img src="/vintage_cats_small.jpg" width={props.width} />;
}

/** the jsx to render when in form content mode */
function FormContent(_props: ContentProps) {
  const [field1Value, setField1Value] = React.useState("");
  const [field2Value, setField2Value] = React.useState("red");
  const options = [
    { value: "red", label: "Red" },
    { value: "blue", label: "Blue" },
    { value: "green", label: "Green" },
  ];

  return (
    <form
      className={styles.form}
      // prevent default behavior (browser refresh + request send)
      onSubmit={(e) => e.preventDefault()}
    >
      <label>
        Name:
        <input
          type="text"
          name="field1"
          value={field1Value}
          onChange={(e) => setField1Value(e.target.value)}
        />
      </label>
      <label>
        Color:
        <select
          value={field2Value}
          onChange={(e) => setField2Value(e.target.value)}
        >
          {options.map((o) => (
            <option value={o.value} key={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      <div className={styles.center}>
        <input type="submit" value="Submit" />
      </div>
    </form>
  );
}

/** the component that orchestrates the marker state */
function HtmlMarker(props: HtmlMarker.Props) {
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

  const ContentComponent = {
    [HtmlContentMode.Video]: VideoContent,
    [HtmlContentMode.Form]: FormContent,
    [HtmlContentMode.Image]: ImageContent,
  }[props.htmlContentMode];

  const contentProps = { height, width };

  return (
    // to use the Marker component we need an IModelJsViewProvider as an ancestor
    <MarkerComponent
      worldLocation={props.worldLocation}
      // pass arbitrary jsx without setting up your own htmlElement
      jsxElement={
        <HtmlMarkerWrapper>
          <div className={styles.markerContent}>
            <ContentComponent {...contentProps} />
          </div>
        </HtmlMarkerWrapper>
      }
      // add decoration is ran every frame, so we can use it to update our distance
      // from the camera every frame
      addDecoration={function (this: Marker, ctx: DecorateContext) {
        const cameraLoc = ctx.viewport.getFrustum().getEyePoint();
        if (cameraLoc) {
          const cameraDistance = cameraLoc.distance(this.worldLocation);
          updateSize(cameraDistance);
          return getSuper(this).addDecoration(ctx);
        }
      }}
    />
  );
}

export default HtmlMarker;
