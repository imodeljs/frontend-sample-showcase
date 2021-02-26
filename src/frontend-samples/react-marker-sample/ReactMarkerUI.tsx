/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { Point3d } from "@bentley/geometry-core";
import {
  IModelApp,
  IModelConnection,
  ScreenViewport,
} from "@bentley/imodeljs-frontend";
import { Button, ButtonType } from "@bentley/ui-core";
import ToolsProvider, { ToolsContext } from "./ReactMarkerTools";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { IModelJsViewProvider } from "@bentley/imodel-react-hooks";
import ReactMarker from "./ReactMarker";
import ReactMarkerApp from "./ReactMarkerApp";
import { request } from "@bentley/itwin-client";

export default function ReactMarkerUI(props: {
  iModelName: string;
  iModelSelector: React.ReactNode;
}) {
  const [points, setPoints] = React.useState<ReactMarker.Props[]>([]);

  const addMarker = (pt: Point3d) => {
    setPoints((pts) => pts.concat({ worldLocation: pt }));
  };

  /** This callback will be executed by ReloadableViewport once the iModel has been loaded */
  const onIModelReady = React.useCallback((_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      // Grab range of the contents of the view. We'll use this to position the first marker
      const range3d = viewport.view.computeFitRange();
      setPoints([{ worldLocation: range3d.center }]);

      // FIXME: need on every animation...
      //requestAnimationFrame(() => );
      viewport.onViewChanged.addListener((vp) => {
        console.log("view changed");
        const cameraLoc = vp.getFrustum().getEyePoint();
        if (cameraLoc) {
          setPoints((prevPoints) =>
            prevPoints.map(({ worldLocation }) => ({
              worldLocation,
              distanceFromCamera: cameraLoc.distance(worldLocation),
            }))
          );
        }
      });
    });
  }, []);

  /** the sample's instructions and controls */
  const controls = (
    <>
      <div className="sample-options-2col">
        <span>Show Markers</span>
        <Button
          buttonType={ButtonType.Blue}
          onClick={() => setPoints([])}
          title="Remove all markers placed in the viewport"
        >
          Remove All Markers
        </Button>
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Manual placement</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <ToolsContext.Consumer>
          {(tools) => (
            <Button
              buttonType={ButtonType.Primary}
              onClick={() =>
                // this will start the tool to handle user input
                IModelApp.tools.run(tools.PlaceMarkerTool.toolId, addMarker)
              }
              title="Click here and then click the view to place a new marker"
            >
              Place Marker
            </Button>
          )}
        </ToolsContext.Consumer>
      </div>
    </>
  );

  return (
    <ToolsProvider
      i18nNamespace={ReactMarkerApp._sampleNamespace}
      addMarker={addMarker}
    >
      <ControlPane
        instructions="Use the options below to control the marker pins.  Click a marker to open a menu of options."
        controls={controls}
        iModelSelector={props.iModelSelector}
      ></ControlPane>
      <ReloadableViewport
        iModelName={props.iModelName}
        onIModelReady={onIModelReady}
      />
      <IModelJsViewProvider>
        {points.map((p, i) => (
          <ReactMarker key={i} worldLocation={p.worldLocation} />
        ))}
      </IModelJsViewProvider>
    </ToolsProvider>
  );
}
