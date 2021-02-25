/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { Point3d, Range2d } from "@bentley/geometry-core";
import {
  IModelApp,
  IModelConnection,
  ScreenViewport,
  StandardViewId,
  ViewState,
} from "@bentley/imodeljs-frontend";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { PlaceMarkerTool } from "./PlaceMarkerTool";
import { PointSelector } from "common/PointSelector/PointSelector";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { IModelJsViewProvider } from "@bentley/imodel-react-hooks";
import ReactMarker from "./Marker";

export default function MarkerPinsUI(props: {
  iModelName: string;
  iModelSelector: React.ReactNode;
}) {
  const [showDecorator, setShowDecorator] = React.useState(true);
  const [points, setPoints] = React.useState<{ worldLocation: Point3d }[]>([]);
  const [range, setRange] = React.useState(Range2d.createXYXY(0, 0, 1, 1));
  const [height, setHeight] = React.useState(0);

  const addMarker = (point: Point3d) => {
    setPoints((points) => points.concat({ worldLocation: point }));
  };

  /** This callback will be executed when the user clicks the UI button.  It will start the tool which
   * handles further user input.
   */
  const startPlaceMarkerTool = () => {
    IModelApp.tools.run(PlaceMarkerTool.toolId, addMarker);
  };

  /** This callback will be executed by ReloadableViewport to initialize the viewstate */
  const getTopView = React.useCallback(
    async (imodel: IModelConnection): Promise<ViewState> => {
      const viewState = await ViewSetup.getDefaultView(imodel);

      // The marker pins look better in a top view
      viewState.setStandardRotation(StandardViewId.Top);

      const range = viewState.computeFitRange();
      const aspect = viewState.getAspectRatio();

      viewState.lookAtVolume(range, aspect);

      return viewState;
    },
    []
  );

  /** This callback will be executed by ReloadableViewport once the iModel has been loaded */
  const onIModelReady = React.useCallback((imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      // Grab range of the contents of the view. We'll use this to position the random markers.
      const range3d = viewport.view.computeFitRange();
      setHeight(range3d.zHigh);
      setRange(Range2d.createFrom(range3d));
    });
  }, []);

  /** Components for rendering the sample's instructions and controls */
  const controls = (
    <>
      <div className="sample-options-2col">
        <span>Show Markers</span>
        <Toggle
          isOn={showDecorator}
          onChange={() => setShowDecorator(!showDecorator)}
        />
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Auto-generate locations</span>
      </div>
      <div className="sample-options-2col">
        <PointSelector onPointsChanged={setPoints} range={range} />
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Manual placement</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <Button
          buttonType={ButtonType.Primary}
          onClick={startPlaceMarkerTool}
          title="Click here and then click the view to place a new marker"
        >
          Place Marker
        </Button>
      </div>
    </>
  );

  /** The sample's render method */
  return (
    <>
      <ControlPane
        instructions="Use the options below to control the marker pins.  Click a marker to open a menu of options."
        controls={controls}
        iModelSelector={props.iModelSelector}
      ></ControlPane>
      <ReloadableViewport
        iModelName={props.iModelName}
        onIModelReady={onIModelReady}
        getCustomViewState={getTopView}
      />
      <IModelJsViewProvider>
        {showDecorator &&
          points.map((p) => <ReactMarker worldLocation={p.worldLocation} />)}
      </IModelJsViewProvider>
    </>
  );
}
