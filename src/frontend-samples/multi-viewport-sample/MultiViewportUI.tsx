/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection, SelectedViewportChangedArgs, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import * as React from "react";
import "./multi-view-sample.scss";
import MultiViewportApp from "./MultiViewportApp";
import { Viewer, ViewerFrontstage } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, SampleIModels, SampleWidgetUiProvider } from "@itwinjs-sandbox";
import { UiItemsProvider } from "@bentley/ui-abstract";
import { MultiViewportFrontstage } from "./MultiViewportFrontstageProvider";
import { ViewSetup } from "api/viewSetup";
import { MultiViewportWidget } from "./MultiViewportWidget";

/** The React state for this UI component */
export interface MultiViewportUIState {
  imodelName?: SampleIModels;
  contextId?: string;
  imodelId?: string;
  frontstages?: ViewerFrontstage[];
  isSynced: boolean;
  viewports: Viewport[];
  selectedViewport?: Viewport;
}

/** A React component that renders the UI specific for this sample */
export default class MultiViewportUI extends React.Component<{}, MultiViewportUIState> {
  private _sampleWidgetUiProvider: SampleWidgetUiProvider;
  private _uiItemProviders: UiItemsProvider[];

  constructor(props: any) {
    super(props);
    this.state = { isSynced: false, viewports: [] };
    this._sampleWidgetUiProvider = new SampleWidgetUiProvider(
      "Use the toolbar at the top-right to navigate the model.  Toggle to sync the viewports.",
      <MultiViewportWidget isSynced={this.state.isSynced} onToggleSyncChange={this._onSyncToggleChange} />,
      this.setState.bind(this),
    );
    this._uiItemProviders = [this._sampleWidgetUiProvider];
  }

  public componentDidUpdate() {
    this._sampleWidgetUiProvider.updateControls({ disabled: this.state.viewports.length !== 2, isSynced: this.state.isSynced });
  }

  public componentDidMount() {
    MultiViewportApp.selectedViewportChangedListeners.length = 0;
    MultiViewportApp.teardownListener.length = 0;
    MultiViewportApp.viewOpenedListeners.length = 0;
  }

  public componentWillUnmount() {
    MultiViewportApp.disconnectViewports();
    MultiViewportApp.selectedViewportChangedListeners.forEach((removeListener) => removeListener());
    MultiViewportApp.selectedViewportChangedListeners.length = 0;
    MultiViewportApp.viewOpenedListeners.forEach((removeListener) => removeListener());
    MultiViewportApp.viewOpenedListeners.length = 0;
    MultiViewportApp.teardownListener.forEach((removeView) => removeView());
    MultiViewportApp.teardownListener.length = 0;
  }

  // Handler to show active viewport in the UI by adding styling to it.
  private _setViewportStyling = (args: SelectedViewportChangedArgs) => {
    if (args.previous)
      args.previous.vpDiv.classList.remove("active-viewport");
    if (args.current)
      args.current.vpDiv.classList.add("active-viewport");
  };

  // Handles changes to the selected viewport and adds the current to the state.
  private _getSelectedViewport = (args: SelectedViewportChangedArgs) => {
    this.setState({ selectedViewport: args.current });
  };

  // Handles opened View and adds them to the state.
  private _getViews = (viewport: Viewport) => {
    const viewports = this.state.viewports;
    this.setState({ viewports: [...viewports, viewport] });
  };

  // Handles when the app teardown is called which signals when the views are all closed.
  private _viewsClosed = () => {
    this.setState({ viewports: [], isSynced: false, selectedViewport: undefined });
  };

  // Adds listeners after the iModel is loaded.
  // Note: The [MultiViewportApp] handles removing theses listeners when they are irrelevant and insuring no duplicates listeners.
  private _onIModelReady = async (iModel: IModelConnection) => {
    MultiViewportApp.listenForSelectedViewportChange(this._setViewportStyling);
    MultiViewportApp.listenForSelectedViewportChange(this._getSelectedViewport);
    MultiViewportApp.listenForViewOpened(this._getViews);
    MultiViewportApp.listenForAppTeardown(this._viewsClosed);

    const viewState = await ViewSetup.getDefaultView(iModel);
    this.setState({ frontstages: [{ provider: new MultiViewportFrontstage(viewState), default: true }] });
  };

  // Handle changes to the UI sync toggle.
  private _onSyncToggleChange = (isOn: boolean) => {
    if (isOn) {
      const selectedViewport = this.state.selectedViewport!;
      const unselectedViewport = this.state.viewports.filter((vp) => vp.viewportId !== selectedViewport?.viewportId)[0];
      // By passing the selected viewport as the first argument, this will be the view
      //  used to override the second argument's view.
      MultiViewportApp.connectViewports(selectedViewport, unselectedViewport);
    } else
      MultiViewportApp.disconnectViewports();

    this.setState({ isSynced: isOn });
  };

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewports to display the iModel */}
        {this.state.imodelName && this.state.contextId && this.state.imodelId &&
          <Viewer
            contextId={this.state.contextId}
            iModelId={this.state.imodelId}
            frontstages={this.state.frontstages}
            authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
            theme="dark"
            uiProviders={this._uiItemProviders}
            onIModelConnected={this._onIModelReady}
          />
        }
      </>
    );
  }
}
