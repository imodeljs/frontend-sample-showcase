/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { Button, ToggleSwitch } from "@itwin/itwinui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { imageElementFromUrl } from "@itwin/core-frontend";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import ClashReviewApi from "./ClashReviewApi";
import "./ClashReview.scss";

const ClashReviewWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [applyZoom, setApplyZoom] = React.useState<boolean>(true);
  const [showDecorator, setShowDecorator] = React.useState<boolean>(true);
  const [clashData, setClashData] = React.useState<any>();
  const [markersData, setMarkersData] = React.useState<MarkerData[]>();
  const [images, setImages] = React.useState<Map<string, HTMLImageElement>>();

  const [clashPinDecorator] = React.useState<MarkerPinDecorator>(() => {
    return ClashReviewApi.setupDecorator();
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
    ClashReviewApi.enableDecorations(clashPinDecorator);
    return () => {
      ClashReviewApi.disableDecorations(clashPinDecorator);
    };
  }, [clashPinDecorator]);

  useEffect(() => {
    /** Create a listener that responds to clashData retrival */
    const removeListener = ClashReviewApi.onClashDataChanged.addListener((data: any) => {
      setClashData(data);
    });

    if (iModelConnection) {
      /** Will start the clashData retrieval and recieve the data through the listener */
      ClashReviewApi.setClashData(iModelConnection.iTwinId!)
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
    return () => {
      removeListener();
    };
  }, [iModelConnection]);

  /** When the clashData comes in, get the marker data */
  useEffect(() => {
    if (iModelConnection && clashData) {
      ClashReviewApi.getClashMarkersData(iModelConnection, clashData).then((mData) => {
        setMarkersData(mData);
      })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  }, [iModelConnection, clashData]);

  useEffect(() => {
    if (markersData && images) {
      ClashReviewApi.setDecoratorPoints(markersData, clashPinDecorator, images);
      // Automatically visualize first clash
      if (markersData !== undefined && markersData.length !== 0 && markersData[0].data !== undefined) {
        ClashReviewApi.visualizeClash(markersData[0].data.elementAId, markersData[0].data.elementBId);
      }
      setShowDecorator(true);
    }
  }, [markersData, images, clashPinDecorator]);

  useEffect(() => {
    if (showDecorator)
      ClashReviewApi.enableDecorations(clashPinDecorator);
    else
      ClashReviewApi.disableDecorations(clashPinDecorator);
  }, [showDecorator, clashPinDecorator]);

  useEffect(() => {
    if (applyZoom) {
      ClashReviewApi.enableZoom();
    } else {
      ClashReviewApi.disableZoom();
    }
  }, [applyZoom]);

  return (
    <>
      <div className="sample-options">
        <div className="iui-alert iui-informational instructions">
          <div className="iui-alert-message">
            Use the toggles to show clash marker pins or zoom to a clash. Click a marker or table entry to review clashes.
          </div>
        </div>
        <ToggleSwitch checked={showDecorator} onChange={() => setShowDecorator(!showDecorator)} label="Show Markers" labelPosition="right" className="sample-options-toggle" />
        <ToggleSwitch checked={applyZoom} onChange={() => setApplyZoom(!applyZoom)} label="Apply Zoom" labelPosition="right" className="sample-options-toggle" />
        <Button size="small" styleType="high-visibility" onClick={ClashReviewApi.resetDisplay} className="sample-options-button">Reset Display</Button>
      </div>
    </>
  );
};

export class ClashReviewWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ClashReviewWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ClashReviewWidget",
          label: "Clash Review Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ClashReviewWidget />,
        },
      );
    }
    return widgets;
  }
}
