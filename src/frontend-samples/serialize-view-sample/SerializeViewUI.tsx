/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import * as React from "react";
import SerializeViewApp from "./SerializeViewApp";
import { SelectOption, SmallText } from "@bentley/ui-core";
import { IModelViews, sampleViewStates, ViewStateWithName } from "./SampleViewStates";
import { ViewStateProps } from "@bentley/imodeljs-common";
import { AuthorizationClient, default3DSandboxUi, IModelSetup, SampleIModels, SampleWidgetUiProvider } from "@itwinjs-sandbox";
import { UiItemsProvider } from "@bentley/ui-abstract";
import { Viewer } from "@bentley/itwin-viewer-react";
import { SerializeViewWidget } from "./SerializeViewWidget";
import { JsonViewerWidget } from "./JsonViewerWidget";

interface SerializeViewState {
  iModelName?: SampleIModels;
  contextId?: string;
  iModelId?: string;
  viewport?: ScreenViewport;
  views: ViewStateWithName[];
  options: SelectOption[];
  currentViewIndex: number;
  jsonViewerTitle: string;
  jsonMenuValue: string;
  jsonError: string | undefined;
  loadStateError: string | undefined;
}

export default class SerializeViewUI extends React.Component<{}, SerializeViewState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiProviders: UiItemsProvider[];

  /** Dictionary of imodelId's to array of viewstates */
  private allSavedViews: IModelViews[] = [...sampleViewStates];

  constructor(props: {}) {
    super(props);
    this.state = {
      views: [],
      options: [],
      currentViewIndex: 0,
      loadStateError: "",
      jsonViewerTitle: "",
      jsonMenuValue: "",
      jsonError: "",
    };
    IModelSetup.setIModelList([SampleIModels.MetroStation, SampleIModels.RetailBuilding]);
    this._changeIModel();
    this._sampleWidgetUiProvider = this._getSampleUi();
    this._sampleWidgetUiProvider.addWidget(
      "JsonViewerWidget",
      "Json Viewer",
      this._getJsonWidget());
    this._uiProviders = [this._sampleWidgetUiProvider];
  }

  private _changeIModel(iModelName?: SampleIModels) {
    IModelSetup.getIModelInfo(iModelName)
      .then(async (info) => {
        this.setState({ iModelName: info.imodelName, contextId: info.projectId, iModelId: info.imodelId });
      });
  }

  private _getSampleUi = () => {
    return new SampleWidgetUiProvider(
      "Choose a view from the list to \"Load\" it into the viewport. Or manipulate the view and select \"Save\" to serialize it.",
      <SerializeViewWidget
        loadStateError={this.state.loadStateError}
        disabled={!!this.state.views.length}
        currentViewIndex={this.state.currentViewIndex}
        options={this.state.options}
        handleSelection={this._handleSelection}
        onSaveStateClick={this._onSaveStateClick}
        onLoadStateClick={this._onLoadStateClick}
      />
    );
  };

  private _getJsonWidget = () => {
    return <JsonViewerWidget
      title={this.state.jsonViewerTitle}
      json={this.state.jsonMenuValue}
      jsonError={this.state.jsonError}
      handleJsonTextChange={this._handleJsonTextChange}
      onSaveJsonViewClick={this._onSaveJsonViewClick}
    />;
  };

  public componentDidUpdate(_prevProps: {}, prevState: SerializeViewState) {
    if (prevState.options !== this.state.options) {
      this._sampleWidgetUiProvider.updateControls({ options: this.state.options });
    }

    /** Update the title and json Menu value if a view has been selected */
    if (prevState.jsonMenuValue !== this.state.jsonMenuValue) {
      this._sampleWidgetUiProvider.updateWidget("JsonViewerWidget", { json: this.state.jsonMenuValue, title: this.state.jsonViewerTitle });
    }
  }

  private readonly _onSaveStateClick = () => {
    const currentimodelid = this.state.viewport?.iModel?.iModelId;
    /** Check that the viewport is not null, and there is an iModel loaded with an ID */
    if (this.state.viewport !== undefined && currentimodelid !== undefined) {

      /** Serialize the current view */
      const viewStateProps = SerializeViewApp.serializeCurrentViewState(this.state.viewport);

      /** Add that serialized view to the list of views to select from */
      this.setState((prevState) => (
        { views: [...prevState.views, { name: `Saved View: ${prevState.views.length + 1}`, view: viewStateProps }], currentViewIndex: prevState.views.length }
      ));
    }
  };

  /** Loads the view selected */
  private readonly _onLoadStateClick = () => {
    if (undefined !== this.state.viewport) {
      const view = this.state.views[this.state.currentViewIndex].view;

      //* * Load the view state. Display error message if there is one */
      SerializeViewApp.loadViewState(this.state.viewport, view)
        .then(() => {
          if (this.state.loadStateError) {
            this.setState({ loadStateError: "" });
          }
        })
        .catch(() => {
          this.setState({ loadStateError: "Error changing view: invalid view state." });
        });
    }
  };

  /** Will be triggered once when the iModel is loaded. */
  private readonly _onIModelReady = (_iModel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport: ScreenViewport) => {
      /** Grab the IModel with views that match the imodel loaded. */
      const iModelWithViews = this.allSavedViews.filter((iModelViews) => {
        return iModelViews.iModelName === this.state.iModelName;
      });

      /** Grab the views of the iModel just loaded and load the first view state in the SampleViewStates.ts */
      const defaultViewIndex = 0;
      const views = iModelWithViews.length > 0 ? iModelWithViews[0].views : [];
      if (views.length !== 0) {
        SerializeViewApp.loadViewState(viewport, views[defaultViewIndex].view);
      }

      /** Prettify the json string */
      const menuValue = undefined !== views[defaultViewIndex] ?
        JSON.stringify(views[defaultViewIndex].view, null, 2)
        : "No View Selected";

      /** Set the views for the imodel in the stae */
      this.setState({
        currentViewIndex: defaultViewIndex,
        viewport,
        views,
        options: this.getOptions(views),
        jsonMenuValue: menuValue,
      });
    });
  };

  /** When a model is selected in list, get its view and switch to it.  */
  private _handleSelection = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const index = Number.parseInt(event.target.selectedOptions[0].value, 10);
    this.setState((prevState) => ({
      currentViewIndex: index,
      jsonMenuValue: JSON.stringify(prevState.views[index].view, null, 2),
    }));
  };

  /** Method called on every user interaction in the json viewer text box */
  private _handleJsonTextChange = async (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    try {
      JSON.parse(event.target.value);
      this.setState({ jsonMenuValue: event.target.value, jsonError: "" });
    } catch (error) {
      this.setState({ jsonMenuValue: event.target.value, jsonError: error.toString() });
    }
  };

  /** Called when user selects 'Save View' */
  private _onSaveJsonViewClick = async () => {
    if (undefined !== this.state.viewport) {
      const views = [...this.state.views];
      const viewStateProps = JSON.parse(this.state.jsonMenuValue) as ViewStateProps;
      if (undefined !== viewStateProps) {
        views[this.state.currentViewIndex].view = viewStateProps;
        this.setState({ views });
      }
    }
  };

  /** Gets the options for the dropdown menu to select views */
  private getOptions(views: ViewStateWithName[]): SelectOption[] {
    return views.map((viewStateWithName: ViewStateWithName, index: number) => {
      return { label: viewStateWithName.name, value: index };
    });
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        {this.state.iModelName && this.state.contextId && this.state.iModelId &&
          <Viewer
            productId="2686"
            contextId={this.state.contextId}
            iModelId={this.state.iModelId}
            //viewportOptions={this.state.viewportOptions}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={this._uiProviders}
            onIModelConnected={this._onIModelReady}
          />
        }
      </>
    );
  }
}
