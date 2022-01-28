/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { ChangeEvent, useCallback, useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { PopupMenu } from "./PopupMenu";
import { PointSelector } from "common/PointSelector/PointSelector";
import { imageElementFromUrl, IModelApp, ScreenViewport } from "@itwin/core-frontend";
import { Point3d, Range2d } from "@itwin/core-geometry";
import MarkerPinApi from "./MarkerPinApi";
import { PlaceMarkerTool } from "./PlaceMarkerTool";
import { MarkerData, MarkerPinDecorator } from "./MarkerPinDecorator";
import { useActiveViewport } from "@itwin/appui-react";
import { Button, RadioTile, RadioTileGroup, ToggleSwitch } from "@itwin/itwinui-react";
import "./MarkerPin.scss";

interface ManualPinSelection {
  name: string;
  image: string;
}

/** A static array of pin images. */
const manualPinSelections: ManualPinSelection[] = [
  { image: "Google_Maps_pin.svg", name: "Google Pin" },
  { image: "pin_celery.svg", name: "Celery Pin" },
  { image: "pin_poloblue.svg", name: "Polo blue Pin" },
];

const MarkerPinWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [showDecoratorState, setShowDecoratorState] = React.useState<boolean>(false);
  const [manualPinState, setManualPinState] = React.useState<ManualPinSelection>(manualPinSelections[0]);
  const [markersDataState, setMarkersDataState] = React.useState<MarkerData[]>([]);
  const [rangeState, setRangeState] = React.useState<Range2d>(Range2d.createNull());
  const [heightState, setHeightState] = React.useState<number>(0);
  const markerPinDecorator = React.useRef<MarkerPinDecorator>();

  useEffect(() => {
    markerPinDecorator.current = MarkerPinApi.setupDecorator();
  }, []);

  /** Load the images on widget startup */
  useEffect(() => {
    MarkerPinApi._images = new Map();

    const p1 = imageElementFromUrl(".\\Google_Maps_pin.svg").then((image) => {
      MarkerPinApi._images.set("Google_Maps_pin.svg", image);
    });

    const p2 = imageElementFromUrl(".\\pin_celery.svg").then((image) => {
      MarkerPinApi._images.set("pin_celery.svg", image);
    });

    const p3 = imageElementFromUrl(".\\pin_poloblue.svg").then((image) => {
      MarkerPinApi._images.set("pin_poloblue.svg", image);
    });

    const p4 = IModelApp.localization.registerNamespace("marker-pin-i18n-namespace");

    void Promise.all([p1, p2, p3, p4]).then(() => {
      PlaceMarkerTool.register("marker-pin-i18n-namespace");
      setShowDecoratorState(true);
    });

    return () => {
      IModelApp.localization.unregisterNamespace("marker-pin-i18n-namespace");
      IModelApp.tools.unRegister(PlaceMarkerTool.toolId);
    };
  }, []);

  const viewInit = useCallback((vp: ScreenViewport) => {

    // Grab range of the contents of the view. We'll use this to position the random markers.
    const range3d = vp.view.computeFitRange();
    const range = Range2d.createFrom(range3d);

    // Grab the max Z for the view contents.  We'll use this as the plane for the auto-generated markers. */
    const height = range3d.zHigh;

    setRangeState(range);
    setHeightState(height);

  }, []);

  /** When the images are loaded, initalize the MarkerPin */
  useEffect(() => {
    if (viewport) {
      viewInit(viewport);
    }
  }, [viewInit, viewport]);

  useEffect(() => {
    if (markerPinDecorator.current) {
      if (showDecoratorState)
        MarkerPinApi.enableDecorations(markerPinDecorator.current);
      else
        MarkerPinApi.disableDecorations(markerPinDecorator.current);
    }
  }, [showDecoratorState]);

  useEffect(() => {
    if (markerPinDecorator.current) {
      MarkerPinApi.setMarkersData(markerPinDecorator.current, markersDataState);
    }
  }, [markersDataState, showDecoratorState]);

  /** This callback will be executed when the user interacts with the PointSelector
   * UI component.  It is also called once when the component initializes.
   */
  const _onPointsChanged = useCallback(async (points: Point3d[]): Promise<void> => {
    const markersData: MarkerData[] = [];
    for (const point of points) {
      point.z = heightState;
      markersData.push({ point });
    }
    setMarkersDataState(markersData);
  }, [heightState]);

  /** Called when the user clicks a new option in the RadioCard UI component */
  const _onManualPinChange: React.MouseEventHandler<HTMLInputElement> = useCallback((event) => {
    const manualPin = manualPinSelections.find((entry: ManualPinSelection) => entry.name === (event.target as any).value)!;
    setManualPinState(manualPin);
  }, []);

  /** This callback will be executed by the PlaceMarkerTool when it is time to create a new marker */
  const _manuallyAddMarker = useCallback((point: Point3d) => {
    if (markerPinDecorator.current) {
      MarkerPinApi.addMarkerPoint(markerPinDecorator.current, point, MarkerPinApi._images.get(manualPinState.image)!);
    }
  }, [manualPinState.image]);

  /** This callback will be executed when the user clicks the UI button.  It will start the tool which
   * handles further user input.
   */
  const _onStartPlaceMarkerTool = useCallback(() => {
    void IModelApp.tools.run(PlaceMarkerTool.toolId, _manuallyAddMarker);
  }, [_manuallyAddMarker]);

  const onShowMarkersChange = useCallback((ev: ChangeEvent<HTMLInputElement>) => {
    setShowDecoratorState(ev.target.checked);
  }, []);

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      {"Use the options below to control the marker pins.  Click a marker to open a menu of options."}
      <hr></hr>
      <PopupMenu canvas={viewport?.canvas} />
      <div className="sample-options-2col">
        <span>Show Markers</span>
        <ToggleSwitch checked={showDecoratorState} onChange={onShowMarkersChange} />
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Auto-generate locations</span>
      </div>
      <div className="sample-options-2col">
        <PointSelector onPointsChanged={_onPointsChanged} range={rangeState} disabled={!showDecoratorState} />
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Manual placement</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <RadioTileGroup >
          {manualPinSelections.map((pin) =>
            <RadioTile
              disabled={!showDecoratorState}
              className="marker-pin-button"
              key={pin.name}
              icon={<object data={pin.image} type="image/svg+xml" />}
              value={pin.name}
              onClick={_onManualPinChange}
              checked={pin.name === manualPinState.name}
            />,
          )}

        </RadioTileGroup>
        <Button disabled={!showDecoratorState} styleType="high-visibility" onClick={_onStartPlaceMarkerTool} title="Click here and then click the view to place a new marker">Place Marker</Button>
      </div>
    </div>
  );

};

export class MarkerPinWidgetProvider implements UiItemsProvider {
  public readonly id: string = "MarkerPinWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "MarkerPinWidget",
          label: "Marker Pin Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <MarkerPinWidget />,
        },
      );
    }
    return widgets;
  }
}
