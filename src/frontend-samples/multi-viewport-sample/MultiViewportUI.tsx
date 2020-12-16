/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection, SelectedViewportChangedArgs, Viewport } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import "./multi-view-sample.scss";
import MultiViewportApp from "./MultiViewportApp";

/** The React state for this UI component */
export interface MultiViewportUIState {
  isSynced: boolean;
  viewports: Viewport[];
  selectedViewport?: Viewport;
}
/** The React props for this UI component */
export interface MultiViewportUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** A React component that renders the UI specific for this sample */
export default class MultiViewportUI extends React.Component<MultiViewportUIProps, MultiViewportUIState> {

  public state: MultiViewportUIState = { isSynced: false, viewports: [] };

  // Handler to show active viewport in the UI by adding styling to it.
  private _setViewportStyling = (args: SelectedViewportChangedArgs) => {
    if (args.previous)
      args.previous.vpDiv.classList.remove("active-viewport");
    if (args.current)
      args.current.vpDiv.classList.add("active-viewport");
  }

  // Handles changes to the selected viewport and adds the current to the state.
  private _getSelectedViewport = (args: SelectedViewportChangedArgs) => {
    this.setState({ selectedViewport: args.current });
  }

  // Handles opened View and adds them to the state.
  private _getViews = (viewport: Viewport) => {
    const viewports = this.state.viewports;
    this.setState({ viewports: [...viewports, viewport] });
  }

  // Handles when the app teardown is called which signals when the views are all closed.
  private _viewsClosed = () => {
    this.setState({ viewports: [], isSynced: false, selectedViewport: undefined });
  }

  // Adds listeners after the iModel is loaded.
  // Note: The [MultiViewportApp] handles removing theses listeners when they are irrelevant and insuring no duplicates listeners.
  private _onIModelReady = (_iModel: IModelConnection) => {
    MultiViewportApp.listenForSelectedViewportChange(this._setViewportStyling);
    MultiViewportApp.listenForSelectedViewportChange(this._getSelectedViewport);
    MultiViewportApp.listenForViewOpened(this._getViews);
    MultiViewportApp.listenForAppTeardown(this._viewsClosed);
  }

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
  }

  /** Components for rendering the sample's instructions and controls */
  public getControls() {
    return (<>
      <div className="sample-options-2col">
        <span>Sync Viewports</span>
        <Toggle disabled={this.state.viewports.length !== 2} isOn={this.state.isSynced} onChange={this._onSyncToggleChange} />
      </div>
    </>);
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane
          controls={this.getControls()}
          iModelSelector={this.props.iModelSelector}
          instructions={"Use the toolbar at the top-right to navigate the model.  Toggle to sync the viewports."}
        />
        { /* Viewports to display the iModel */}
        <div className={"mutli-view-viewport-top"}>
          <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        </div>
        <div className={"mutli-view-viewport-bottom"}>
          <SandboxViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        </div>
      </>
    );
  }
}
