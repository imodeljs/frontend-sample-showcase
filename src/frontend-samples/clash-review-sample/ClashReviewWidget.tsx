import React, { useCallback, useEffect } from "react";
import { ModalDialogManager, useActiveIModelConnection } from "@bentley/ui-framework";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { MarkerData } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import ClashReviewApi from "./ClashReviewApi";
import { imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { Button, ButtonSize, ButtonType, Dialog, DialogAlignment, Toggle } from "@bentley/ui-core";
import "./ClashReview.scss";
import { ClashReviewTable } from "./ClashReviewTableWidget";

const ClashReviewWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [applyZoom, setApplyZoom] = React.useState<boolean>(true);
  const [showDecorator, setShowDecorator] = React.useState<boolean>(true);
  //const [clashData, setClashData] = React.useState<any>();
  const [markersData, setMarkersData] = React.useState<MarkerData[]>([]);
  const [initalized, setInitalized] = React.useState<boolean>(false);

  const _openDialog = useCallback(() => {
    ModalDialogManager.openDialog(
      <Dialog
        opened={true}
        modal={false}
        width={"100%"}
        height={200}
        alignment={DialogAlignment.Bottom}
      >
        <ClashReviewTable clashData={undefined} />
      </Dialog>);
  }, []);

  const _handleDialogClose = () => {
    ModalDialogManager.closeDialog();
  };

  useEffect(() => {
    if (!initalized) {
      //_openDialog();
      ClashReviewApi._images = new Map();
      imageElementFromUrl(".\\clash_pin.svg").then((image) => {
        ClashReviewApi._images.set("clash_pin.svg", image);
      });
      setInitalized(true);
    }
    return () => {
      ClashReviewApi.disableDecorations();
      ClashReviewApi.resetDisplay();
    };
  }, [_openDialog, iModelConnection, initalized]);

  useEffect(() => {
    if (ClashReviewApi.decoratorIsSetup())
      ClashReviewApi.setDecoratorPoints(markersData);
    else {
      ClashReviewApi.setupDecorator(markersData);
    }
  }, [markersData]);

  useEffect(() => {
    if (showDecorator)
      ClashReviewApi.enableDecorations();
    else
      ClashReviewApi.disableDecorations();
  }, [showDecorator]);

  useEffect(() => {
    if (applyZoom) {
      ClashReviewApi.enableZoom();
    } else {
      ClashReviewApi.disableZoom();
    }
  }, [applyZoom]);

  //   /** This callback will be executed by iTwin Viewer to initialize the viewstate */
  //   private _oniModelReady = async (iModelConnection: IModelConnection) => {

  //   if (this.state.contextId) {
  //     const clashData = await ClashReviewApp.getClashData(this.state.contextId);
  //     const markersData = await ClashReviewApp.getClashMarkersData(iModelConnection, clashData);

  //     this.setState({ clashData, markersData });

  //     // Automatically visualize first clash
  //     if (markersData !== undefined && markersData.length !== 0 && markersData[0].data !== undefined) {
  //       ClashReviewApp.visualizeClash(markersData[0].data.elementAId, markersData[0].data.elementBId);
  //     }
  //   }
  // };

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
          <Button size={ButtonSize.Default} buttonType={ButtonType.Blue} onClick={ClashReviewApi.resetDisplay}>Reset</Button>
        </div>
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
        }
      );
    }
    return widgets;
  }
}
