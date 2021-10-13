import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { Button, ButtonSize, ButtonType, Toggle } from "@bentley/ui-core";
import PropertyValidationApi from "./PropertyValidationApi";
import "./PropertyValidationReview.scss";

const PropertyValidationWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [applyZoom, setApplyZoom] = React.useState<boolean>(true);
  const [showDecorator, setShowDecorator] = React.useState<boolean>(true);
  const [validationResults, setValidationResults] = React.useState<any>();
  const [ruleData, setRuleData] = React.useState<any>();
  const [markersData, setMarkersData] = React.useState<MarkerData[]>();
  const [images, setImages] = React.useState<Map<string, HTMLImageElement>>();
  const [validationDecorator] = React.useState<MarkerPinDecorator>(() => {
    return PropertyValidationApi.setupDecorator();
  });

  useEffect(() => {
    const newImages = new Map();
    imageElementFromUrl(".\\clash_pin.svg").then((image) => {
      newImages.set("clash_pin.svg", image);
      setImages(newImages);
    })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, []);

  /** Initialize Decorator */
  useEffect(() => {
    PropertyValidationApi.enableDecorations(validationDecorator);
    return () => {
      PropertyValidationApi.disableDecorations(validationDecorator);
    };
  }, [validationDecorator]);

  useEffect(() => {
    /** Create a listener that responds to validation data retrival */
    const removeListener = PropertyValidationApi.onValidationDataChanged.addListener((data: any) => {
      setValidationResults(data.validationData);
      setRuleData(data.ruleData);
    });

    if (iModelConnection) {
      /** Will start the validation data retrieval and recieve the data through the listener */
      PropertyValidationApi.setValidationData(iModelConnection.contextId!).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  /** When the validation data comes in, get the marker data */
  useEffect(() => {
    if (iModelConnection && validationResults && ruleData) {
      PropertyValidationApi.getValidationMarkersData(iModelConnection, validationResults, ruleData).then((mData) => {
        setMarkersData(mData);
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
  }, [iModelConnection, validationResults, ruleData]);

  useEffect(() => {
    if (markersData && images) {
      PropertyValidationApi.setDecoratorPoints(markersData, validationDecorator, images);
      // Automatically visualize first property validation failure
      if (markersData !== undefined && markersData.length > 5 && markersData[5].data !== undefined) {
        PropertyValidationApi.visualizeViolation(markersData[5].data.elementId);
      }
      setShowDecorator(true);
    }
  }, [markersData, images, validationDecorator]);

  useEffect(() => {
    if (showDecorator)
      PropertyValidationApi.enableDecorations(validationDecorator);
    else
      PropertyValidationApi.disableDecorations(validationDecorator);
  }, [showDecorator, validationDecorator]);

  useEffect(() => {
    if (applyZoom) {
      PropertyValidationApi.enableZoom();
    } else {
      PropertyValidationApi.disableZoom();
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
          <Button size={ButtonSize.Default} buttonType={ButtonType.Blue} onClick={PropertyValidationApi.resetDisplay}>Reset</Button>
        </div>
      </div>
    </>
  );
};

export class PropertyValidationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "PropertyValidationReviewWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "PropertyValidationWidget",
          label: "Settings",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <PropertyValidationWidget />,
        }
      );
    }
    return widgets;
  }
}
