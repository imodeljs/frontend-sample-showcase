/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import styles from "./HtmlMarker.module.scss";
import { Point3d } from "@bentley/geometry-core";
import {
  IModelApp,
  IModelConnection,
  ScreenViewport,
} from "@bentley/imodeljs-frontend";
import { Button, ButtonType, Select } from "@bentley/ui-core";
import ToolsProvider, { ToolsContext } from "./HtmlMarkerTools";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import { ControlPane } from "common/ControlPane/ControlPane";
import { IModelJsViewProvider } from "@bentley/imodel-react-hooks";
import HtmlMarker from "./HtmlMarker";

const i18nNamespaceKey = "react-marker-i18n-namespace" as string;

export enum HtmlContentMode {
  Image = "picture",
  Video = "video",
  Form = "form",
}

export default function HtmlMarkerUI(props: {
  iModelName: string;
  iModelSelector: React.ReactNode;
}) {
  const [points, setPoints] = React.useState<Point3d[]>([]);
  const [htmlContentMode, setHtmlContentMode] = React.useState(
    HtmlContentMode.Form
  );

  const addMarker = (pt: Point3d) => {
    setPoints((pts) => pts.concat(pt));
  };

  const sampleNamespace = IModelApp.i18n.registerNamespace(i18nNamespaceKey);

  React.useEffect(() => () =>
    IModelApp.i18n.unregisterNamespace(i18nNamespaceKey)
  );

  /** This callback will be executed by ReloadableViewport once the iModel has been loaded */
  const onIModelReady = React.useCallback((_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      // Grab range of the contents of the view. We'll use this to position the first marker
      const range3d = viewport.view.computeFitRange();
      setPoints([range3d.center]);
    });
  }, []);

  /** the sample's instructions and controls */
  const controls = (
    <>
      <div className={styles.sampleOpts2Col}>
        <span>HTML Content Type</span>
        <Select
          value={htmlContentMode}
          onChange={(e) =>
            setHtmlContentMode(e.target.value as HtmlContentMode)
          }
          options={{
            [HtmlContentMode.Image]: "picture",
            [HtmlContentMode.Video]: "video",
            [HtmlContentMode.Form]: "form",
          }}
        />
      </div>
      <hr></hr>
      <div className={styles.sampleOpts2Col}>
        <Button
          buttonType={ButtonType.Blue}
          onClick={() => setPoints([])}
          title="Remove all markers placed in the viewport"
        >
          Remove All Markers
        </Button>
        <ToolsContext.Consumer>
          {(tools) => (
            <Button
              buttonType={ButtonType.Primary}
              onClick={() =>
                // this will start the tool to handle user input
                IModelApp.tools.run(tools.PlaceMarkerTool.toolId, addMarker)
              }
              title="Click here and then click in the view to place a new marker"
            >
              Place Marker
            </Button>
          )}
        </ToolsContext.Consumer>
      </div>
    </>
  );

  return (
    <ToolsProvider i18nNamespace={sampleNamespace} addMarker={addMarker}>
      <ControlPane
        instructions="Use the options below to control the marker pins.  Click a marker to open a menu of options."
        controls={controls}
        iModelSelector={props.iModelSelector}
      ></ControlPane>
      <SandboxViewport
        iModelName={props.iModelName}
        onIModelReady={onIModelReady}
      />
      <IModelJsViewProvider>
        {points.map((p) => (
          <HtmlMarker
            key={`${p.x}_${p.y}_${p.z}`}
            worldLocation={p}
            htmlContentMode={htmlContentMode}
          />
        ))}
      </IModelJsViewProvider>
    </ToolsProvider>
  );
}
