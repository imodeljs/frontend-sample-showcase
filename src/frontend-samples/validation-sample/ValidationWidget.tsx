/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { imageElementFromUrl } from "@itwin/core-frontend";
import { Button, ToggleSwitch } from "@itwin/itwinui-react";
import ValidationApi from "./ValidationApi";
import "./ValidationReview.scss";

const ValidationWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [applyZoom, setApplyZoom] = React.useState<boolean>(true);
  const [showDecorator, setShowDecorator] = React.useState<boolean>(true);
  const [validationResults, setValidationResults] = React.useState<any>();
  const [ruleData, setRuleData] = React.useState<any>();
  const [markersData, setMarkersData] = React.useState<MarkerData[]>();
  const [images, setImages] = React.useState<Map<string, HTMLImageElement>>();
  const [validationDecorator] = React.useState<MarkerPinDecorator>(() => {
    return ValidationApi.setupDecorator();
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
    ValidationApi.enableDecorations(validationDecorator);
    return () => {
      ValidationApi.disableDecorations(validationDecorator);
    };
  }, [validationDecorator]);

  useEffect(() => {
    /** Create a listener that responds to validation data retrieval */
    const removeListener = ValidationApi.onValidationDataChanged.addListener((data: any) => {
      setValidationResults(data.validationData);
      setRuleData(data.ruleData);
    });

    if (iModelConnection) {
      /** Will start the validation data retrieval and recieve the data through the listener */
      ValidationApi.getValidationData(iModelConnection.iTwinId!).catch((error) => {
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
      ValidationApi.getValidationMarkersData(iModelConnection, validationResults, ruleData).then((mData) => {
        setMarkersData(mData);
      }).catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
    }
  }, [iModelConnection, validationResults, ruleData]);

  useEffect(() => {
    if (markersData && images) {
      ValidationApi.setDecoratorPoints(markersData, validationDecorator, images.get("clash_pin.svg")!);
      // Automatically visualize first clash
      if (markersData !== undefined && markersData.length !== 0 && markersData[0].data !== undefined) {
        ValidationApi.visualizeViolation(markersData[0].data.elementId);
      }
      setShowDecorator(true);
    }
  }, [markersData, images, validationDecorator]);

  useEffect(() => {
    if (showDecorator)
      ValidationApi.enableDecorations(validationDecorator);
    else
      ValidationApi.disableDecorations(validationDecorator);
  }, [showDecorator, validationDecorator]);

  useEffect(() => {
    if (applyZoom) {
      ValidationApi.enableZoom();
    } else {
      ValidationApi.disableZoom();
    }
  }, [applyZoom]);

  return (
    <div className="sample-options">
      <div className="iui-alert iui-informational sample-options-block">
        <div className="iui-alert-message">
          Use the toggles to show marker pins or zoom to a validation rule violation.
          Click a marker or table entry to review these rule violations.
        </div>
      </div>
      <ToggleSwitch label="Show Markers" checked={showDecorator} onChange={() => setShowDecorator(!showDecorator)} className="sample-options-block"></ToggleSwitch>
      <ToggleSwitch label="Apply Zoom" checked={applyZoom} onChange={() => setApplyZoom(!applyZoom)} className="sample-options-block"></ToggleSwitch>
      <Button size="small" styleType="high-visibility" onClick={ValidationApi.resetDisplay} className="sample-options-button">Reset Display</Button>
    </div>
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
        },
      );
    }
    return widgets;
  }
}
