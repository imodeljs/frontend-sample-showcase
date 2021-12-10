/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { Button, Dialog, Select, SelectOption, SmallText } from "@itwin/core-react";
import { ModalDialogManager } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { ViewStateProps } from "@itwin/core-common";
import { IModelApp, ScreenViewport } from "@itwin/core-frontend";
import { IModelViews, sampleViewStates, ViewStateWithName } from "./SampleViewStates";
import { JsonViewerWidget } from "./JsonViewerWidget";
import SerializeViewApi from "./SerializeViewApi";
import "./SerializeView.scss";

export const SerializeViewWidget: React.FunctionComponent = () => {
  const viewport = IModelApp.viewManager.selectedView;
  const allSavedViews: IModelViews[] = [...sampleViewStates];
  const [currentViewIndexState, setCurrentViewIndexState] = React.useState<number>(0);
  const [viewsState, setViewsState] = React.useState<ViewStateWithName[]>([]);
  const [optionsState, setOptionsState] = React.useState<SelectOption[]>([]);
  const [jsonViewerTitleState, setJsonViewerTitleState] = React.useState<string>("");
  const [jsonMenuValueState, setJsonMenuValueState] = React.useState<string>("");
  const [loadStateError, setLoadStateError] = React.useState<string | undefined>("");

  useEffect(() => {
    if (viewport)
      _init(viewport);
    else
      IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => _init(_vp));

    return () => {
      ModalDialogManager.closeDialog();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (viewsState.length === 0)
      return;

    setJsonViewerTitleState(viewsState[currentViewIndexState].name);
    setJsonMenuValueState(JSON.stringify(viewsState[currentViewIndexState].view, null, 2));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentViewIndexState]);

  const _init = (vp: ScreenViewport) => {
    /** Grab the IModel with views that match the imodel loaded. */
    const iModelWithViews = allSavedViews.filter((iModelViews) => {
      return iModelViews.iModelId === vp.iModel.iModelId;
    });

    /** Grab the views of the iModel just loaded and load the first view state in the SampleViewStates.ts */
    const views = iModelWithViews.length > 0 ? iModelWithViews[0].views : [];

    /** Prettify the json string */
    const menuValue = undefined !== views[currentViewIndexState] ?
      JSON.stringify(views[currentViewIndexState].view, null, 2)
      : "No View Selected";

    const title = undefined !== views[currentViewIndexState] ? views[currentViewIndexState].name : "";

    /** Set the views for the imodel in the stae */
    setViewsState(views);
    setOptionsState(getOptions(views));
    setJsonViewerTitleState(title);
    setJsonMenuValueState(menuValue);
  };

  const _onSaveStateClick = () => {
    const currentimodelid = viewport?.iModel?.iModelId;
    /** Check that the viewport is not null, and there is an iModel loaded with an ID */
    if (viewport !== undefined && currentimodelid !== undefined) {

      /** Serialize the current view */
      const viewStateProps = SerializeViewApi.serializeCurrentViewState(viewport);

      /** Add that serialized view to the list of views to select from */
      const views = [...viewsState, { name: `Saved View: ${viewsState.length + 1}`, view: viewStateProps }];
      setViewsState(views);
      setOptionsState(getOptions(views));
      setCurrentViewIndexState(viewsState.length);
    }
  };

  /** Loads the view selected */
  const _onLoadStateClick = () => {
    if (viewport) {

      /** Close the dialog box if switching views */
      _handleDialogClose();

      const view = viewsState[currentViewIndexState].view;

      /** Load the view state. Display error message if there is one */
      SerializeViewApi.loadViewState(viewport, view)
        .then(() => {
          if (loadStateError) {
            setLoadStateError("");
          }
        })
        .catch(() => {
          setLoadStateError(`Error changing view: invalid view state.`);
        });
    }
  };

  /** Gets the options for the dropdown menu to select views */
  const getOptions = (views: ViewStateWithName[]): SelectOption[] => {
    return views.map((viewStateWithName: ViewStateWithName, index: number) => {
      return { label: viewStateWithName.name, value: index };
    });
  };

  /** Helper method for showing an error */
  const showError = (stateProp: string | undefined) => {
    if (!stateProp) {
      return (<div></div>);
    }

    return (
      <div style={{ overflowWrap: "break-word" }}>
        <SmallText style={{ color: "var(--foreground-alert)" }}>
          ${stateProp}
        </SmallText>
      </div>
    );
  };

  /** Called when user selects 'Save View' */
  const _onSaveJsonViewClick = async (json: string) => {
    if (viewport) {
      const viewStateProps = JSON.parse(json) as ViewStateProps;
      setJsonMenuValueState(json);
      const views = [...viewsState];
      if (undefined !== viewStateProps) {
        views[currentViewIndexState].view = viewStateProps;
        setViewsState(views);
      }
    }
  };

  // Helper method to get the offset position of an element on the browser
  const getOffset = (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return {
      left: rect.left + window.scrollX,
      top: rect.top + window.scrollY,
      bottom: rect.bottom,
    };
  };

  const _openDialog = () => {
    const offset = getOffset(viewport!.canvas);
    ModalDialogManager.openDialog(
      <Dialog
        opened={true}
        modal={false}
        onClose={_handleDialogClose}
        resizable={true}
        movable={true}
        title={jsonViewerTitleState}
        width={400}

        // This is specific for this sample-showcase, the better approach is to use the
        // 'alignment' prop to specify the inital location on screen
        x={offset.left + 20}
        y={offset.bottom - 380}
      >
        <JsonViewerWidget
          json={jsonMenuValueState}
          onSaveJsonViewClick={_onSaveJsonViewClick} />
      </Dialog>);
  };

  const _handleDialogClose = () => {
    ModalDialogManager.closeDialog();
  };

  return (
    <>
      <div className="sample-options">
        {"Choose a view from the list to \"Load\" it into the viewport. Or manipulate the view and select \"Save\" to serialize it."}
        <hr></hr>
        <span>Select View: </span>
        <Select options={optionsState} onChange={(event) => setCurrentViewIndexState(Number.parseInt(event.target.selectedOptions[0].value, 10))} style={{ width: "fit-content" }} disabled={viewsState.length === 0} value={currentViewIndexState} />
        <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <Button onClick={_onSaveStateClick} disabled={viewsState.length === 0}>Save State</Button>
          <Button onClick={_onLoadStateClick} disabled={viewsState.length === 0}>Load State</Button>
        </div>
        {showError(loadStateError)}
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Button onClick={_openDialog} disabled={viewsState.length === 0}>Edit Json</Button>
        </div>
      </div>
    </>
  );
};

export class SerializeViewWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SerializeViewWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "SerializeViewWidget",
          label: "Serialize View Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <SerializeViewWidget />,
        }
      );
    }
    return widgets;
  }
}
