/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import React from "react";
import ReactDOM from "react-dom";
import { Point3d } from "@bentley/geometry-core";
import { Marker, DecorateContext } from "@bentley/imodeljs-frontend";
import {
  Marker as MarkerComponent,
  getSuper,
} from "@bentley/imodel-react-hooks";
import styles from "./ReactMarker.module.scss";
import { HtmlContentMode } from "./ReactMarkerUI";

declare namespace ReactMarker {
  export interface Props {
    worldLocation: Point3d;
    htmlContentMode: HtmlContentMode;
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

interface ContentProps {
  width: number;
  height: number;
}

function VideoContent(props: ContentProps) {
  return (
    <video controls loop muted width={props.width} height={props.height}>
      <source src="/cat_walking.mp4" type="video/mp4" />
      Your browser does not support video tags :(
    </video>
  );
}

function ImageContent(props: ContentProps) {
  return (
    <img src="/cat_sitting.png" width={props.width} height={props.height} />
  );
}

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
      //onClickCapture={(e) => e.stopPropagation()}
      //onMouseOverCapture={(e) => e.stopPropagation()}
      //onMouseMoveCapture={(e) => e.stopPropagation()}
      //onMouseDownCapture={(e) => e.stopPropagation()}
      //onMouseUpCapture={(e) => e.stopPropagation()}
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
          //onClick={() => console.log("click")}
          //onClickCapture={() => console.log("click capture")}
          //onMouseDown={() => console.log("mousedown")}
          //onMouseDownCapture={() => console.log("mousedown capture")}
          //onFocusCapture={() => console.log("focus")}
          //onBlurCapture={() => console.log("blur")}
          //onMouseMove={() => console.log("mousemove")}
          //onMouseMoveCapture={() => console.log("mousemove capture")}
          //onMouseOver={() => console.log("mouseover capture")}
          //onMouseOverCapture={() => console.log("mouseover capture")}
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

function ReactMarker(props: ReactMarker.Props) {
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

  const portalElem = React.useRef(document.createElement("div")).current;
  React.useEffect(() => {
    document.body.append(portalElem);
  }, []);

  const portalBridgeElem = React.useRef<HTMLDivElement>(null);

  // older versions of imodeljs
  const portalElemStyle = (() => {
    const parentElem = portalBridgeElem.current?.parentElement;
    console.log(parentElem);
    if (parentElem && !parentElem.classList.contains("overlay-decorators")) {
      const markerPositionerElem = parentElem;
      const rect = markerPositionerElem.getBoundingClientRect();
      return {
        left: `${rect.left + 0.5 * rect.width}px`,
        top: `${rect.top + 0.5 * rect.height}px`,
        position: "absolute" as const,
      };
    }
    return { display: "none" };
  })();

  return (
    // to use the Marker component we need an IModelJsViewProvider as an ancestor
    <MarkerComponent
      worldLocation={props.worldLocation}
      // pass arbitrary jsx without setting up your own htmlElement
      jsxElement={
        <div ref={portalBridgeElem}>
          {ReactDOM.createPortal(
            <div className={styles.markerContent} style={portalElemStyle}>
              <ContentComponent {...contentProps} />
            </div>,
            portalElem
          )}
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
