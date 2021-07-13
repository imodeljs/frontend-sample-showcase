import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { MarkerData } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { Button, ButtonSize, ButtonType, Toggle } from "@bentley/ui-core";
import ValidationApi from "./ValidationApi";
import "./ValidationReview.scss";

const ValidationWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [applyZoom, setApplyZoom] = React.useState<boolean>(true);
  const [showDecorator, setShowDecorator] = React.useState<boolean>();
  const [validationResults, setValidationResults] = React.useState<any>();
  const [markersData, setMarkersData] = React.useState<MarkerData[]>();

  useEffect(() => {
    /** Create a listener that responds to validation data retrival */
    const removeListener = ValidationApi.onValidationDataChanged.addListener((data: any) => {
      setValidationResults(data);
    });

    if (iModelConnection) {
      /** Initalize the marker pin svg icons on screen */
      ValidationApi._images = new Map();
      imageElementFromUrl(".\\clash_pin.svg").then((image) => {
        ValidationApi._images.set("clash_pin.svg", image);
      });

      /** Will start the validation data retrieval and recieve the data through the listener */
      ValidationApi.setValidationData(iModelConnection.contextId!);
    }
    return () => {
      removeListener();
      ValidationApi.disableDecorations();
      ValidationApi.resetDisplay();
    };
  }, [iModelConnection]);

  /** When the validatio data comes in, get the marker data */
  useEffect(() => {
    if (iModelConnection && validationResults) {
      ValidationApi.getValidationMarkersData(iModelConnection, validationResults).then((mData) => {
        setMarkersData(mData);
      });
    }
  }, [iModelConnection, validationResults]);

  useEffect(() => {
    if (markersData && ValidationApi.decoratorIsSetup()) {
      ValidationApi.setDecoratorPoints(markersData);
    } else if (markersData) {
      ValidationApi.setupDecorator(markersData);
      // Automatically visualize first violation
      if (markersData !== undefined && markersData.length !== 0 && markersData[0].data !== undefined) {
        ValidationApi.visualizeViolation(markersData[0].data.elementId);
      }
      setShowDecorator(true);
    }
  }, [markersData]);

  useEffect(() => {
    if (showDecorator)
      ValidationApi.enableDecorations();
    else
      ValidationApi.disableDecorations();
  }, [showDecorator]);

  useEffect(() => {
    if (applyZoom) {
      ValidationApi.enableZoom();
    } else {
      ValidationApi.disableZoom();
    }
  }, [applyZoom]);

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col">
          <span>Show Markers</span>
          <Toggle isOn={showDecorator} onChange={(checked: boolean) => setShowDecorator(checked)} />
        </div>
        <div className="sample-options-2col">
          <span>Apply Zoom</span>
          <Toggle isOn={applyZoom} onChange={(checked: boolean) => setApplyZoom(checked)} />
        </div>
        <div className="sample-options-2col">
          <span>Display</span>
          <Button size={ButtonSize.Default} buttonType={ButtonType.Blue} onClick={ValidationApi.resetDisplay}>Reset</Button>
        </div>
      </div>
    </>
  );
};

export class ValidationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ValidationReviewWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ValidationWidget",
          label: "ValidationWidget",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ValidationWidget />,
        }
      );
    }
    return widgets;
  }
}
