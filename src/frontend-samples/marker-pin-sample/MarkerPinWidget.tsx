/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { PopupMenu } from "./PopupMenu";
import { Button, ButtonType, Toggle } from "@bentley/ui-core";
import { PointSelector } from "common/PointSelector/PointSelector";
import { RadioCard, RadioCardEntry } from "./RadioCard/RadioCard";
import { imageElementFromUrl, IModelApp } from "@bentley/imodeljs-frontend";
import { Point3d, Range2d } from "@bentley/geometry-core";
import MarkerPinApi from "./MarkerPinApi";
import { PlaceMarkerTool } from "./PlaceMarkerTool";
import { MarkerData } from "./MarkerPinDecorator";
import "./MarkerPin.scss";

interface ManualPinSelection {
  name: string;
  image: string;
}

const MarkerPinWidget: React.FunctionComponent = () => {

  /** A static array of pin images. */
  const getManualPinSelections = (): ManualPinSelection[] => {
    return ([
      { image: "Google_Maps_pin.svg", name: "Google Pin" },
      { image: "pin_celery.svg", name: "Celery Pin" },
      { image: "pin_poloblue.svg", name: "Polo blue Pin" }]);
  };

  const viewport = IModelApp.viewManager.selectedView;
  const [imagesLoadedState, setImagesLoadedState] = React.useState<boolean>(false);
  const [showDecoratorState, setShowDecoratorState] = React.useState<boolean>(true);
  const [manualPinState, setManualPinState] = React.useState<ManualPinSelection>(getManualPinSelections()[0]);
  const [markersDataState, setMarkersDataState] = React.useState<MarkerData[]>([]);
  const [rangeState, setRangeState] = React.useState<Range2d>(Range2d.createNull());
  const [heightState, setHeightState] = React.useState<number>(0);

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

    Promise.all([p1, p2, p3]).then(() => {
      setImagesLoadedState(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** When the images are loaded, initalize the MarkerPin */
  useEffect(() => {
    if (!imagesLoadedState)
      return;

    MarkerPinApi._sampleNamespace = IModelApp.i18n.registerNamespace("marker-pin-i18n-namespace");

    PlaceMarkerTool.register(MarkerPinApi._sampleNamespace);

    MarkerPinApi.setupDecorator(markersDataState);
    MarkerPinApi.enableDecorations();

    if (viewport)
      viewInit();
    else
      IModelApp.viewManager.onViewOpen.addOnce(() => viewInit());

    return () => {
      MarkerPinApi.disableDecorations();
      MarkerPinApi._markerDecorator = undefined;

      IModelApp.i18n.unregisterNamespace("marker-pin-i18n-namespace");
      IModelApp.tools.unRegister(PlaceMarkerTool.toolId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imagesLoadedState]);

  useEffect(() => {
    if (showDecoratorState)
      MarkerPinApi.enableDecorations();
    else
      MarkerPinApi.disableDecorations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showDecoratorState]);

  useEffect(() => {
    MarkerPinApi.setMarkersData(markersDataState);
  }, [markersDataState]);

  const viewInit = () => {
    if (!viewport)
      return;

    // Grab range of the contents of the view. We'll use this to position the random markers.
    const range3d = viewport.view.computeFitRange();
    const range = Range2d.createFrom(range3d);

    // Grab the max Z for the view contents.  We'll use this as the plane for the auto-generated markers. */
    const height = range3d.zHigh;

    setRangeState(range);
    setHeightState(height);

  };

  /** This callback will be executed when the user interacts with the PointSelector
   * UI component.  It is also called once when the component initializes.
   */
  const _onPointsChanged = async (points: Point3d[]): Promise<void> => {
    const markersData: MarkerData[] = [];
    for (const point of points) {
      point.z = heightState;
      markersData.push({ point });
    }
    setMarkersDataState(markersData);
  };

  /** Creates the array which populates the RadioCard UI component */
  const getMarkerList = (): RadioCardEntry[] => {
    return (getManualPinSelections().map((entry: ManualPinSelection) => ({ image: entry.image, value: entry.name })));
  };

  /** Called when the user clicks a new option in the RadioCard UI component */
  const _onManualPinChange = (name: string) => {
    const manualPin = getManualPinSelections().find((entry: ManualPinSelection) => entry.name === name)!;
    setManualPinState(manualPin);
  };

  /** This callback will be executed by the PlaceMarkerTool when it is time to create a new marker */
  const _manuallyAddMarker = (point: Point3d) => {
    MarkerPinApi.addMarkerPoint(point, MarkerPinApi._images.get(manualPinState.image)!);
  };

  /** This callback will be executed when the user clicks the UI button.  It will start the tool which
   * handles further user input.
   */
  const _onStartPlaceMarkerTool = () => {
    IModelApp.tools.run(PlaceMarkerTool.toolId, _manuallyAddMarker);
  };

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      {"Use the options below to control the marker pins.  Click a marker to open a menu of options."}
      <hr></hr>
      <PopupMenu canvas={viewport?.canvas} />
      <div className="sample-options-2col">
        <span>Show Markers</span>
        <Toggle isOn={showDecoratorState} onChange={(checked: boolean) => setShowDecoratorState(checked)} />
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Auto-generate locations</span>
      </div>
      <div className="sample-options-2col">
        <PointSelector onPointsChanged={_onPointsChanged} range={rangeState} />
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Manual placement</span>
      </div>
      <div style={{ textAlign: "center" }}>
        <RadioCard entries={getMarkerList()} selected={manualPinState.name} onChange={_onManualPinChange} />
        <Button buttonType={ButtonType.Primary} onClick={_onStartPlaceMarkerTool} title="Click here and then click the view to place a new marker">Place Marker</Button>
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
        }
      );
    }
    return widgets;
  }
}
