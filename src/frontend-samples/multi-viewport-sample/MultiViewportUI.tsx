/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection, SelectedViewportChangedArgs, Viewport } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import "common/samples-common.scss";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
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
  setupControlPane: (instructions: string, controls?: React.ReactNode, className?: string) => void;
}

/** A React component that renders the UI specific for this sample */
export default class MultiViewportUI extends React.Component<MultiViewportUIProps, MultiViewportUIState> {

  public state: MultiViewportUIState = { isSynced: false, viewports: [] };

  // Handler to show active viewport in the UI by adding styling to it.
  private _setViewportStyling = (args: SelectedViewportChangedArgs) => {
    if (args.previous)
      args.previous!.vpDiv.classList.remove("active-viewport");
    if (args.current)
      args.current.vpDiv.classList.add("active-viewport");
  }

  // Handles opened View and adds them to the state.
  private _getViews = (viewport: Viewport) => {
    this.setState({ viewports: [...this.state.viewports, viewport] });
  }

  // Handles changes to the selected viewport and adds the current to the state.
  private _getSelectedViewport = (args: SelectedViewportChangedArgs) => {
    this.setState({ selectedViewport: args.current });
  }

  public componentDidMount() {
    this.props.setupControlPane("Use the controls below to effect the highlighted selected viewport. Syncing the viewports will initially match to the selected viewport.", this.getControls());
  }

  // Adds listeners after the iModel is loaded.
  // Note: The [MultiViewportApp] handles removing theses listeners they are irrelevant and insuring no duplicates.
  private _onIModelReady = (_iModel: IModelConnection) => {
    MultiViewportApp.listenForSelectedViewportChange(this._setViewportStyling);
    MultiViewportApp.listenForSelectedViewportChange(this._getSelectedViewport);
    MultiViewportApp.listenForViewOpened(this._getViews);
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

  public getControls(): React.ReactNode {
    console.debug(`disabled: ${this.state.viewports.length !== 2}`, this.state.viewports.length);
    return (<>
      <div className="sample-options-2col">
        <span>Sync Viewports</span>
        <Toggle disabled={this.state.viewports.length !== 2} isOn={this.state.isSynced} onChange={this._onSyncToggleChange} />
      </div>
    </>);
  }

  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        <div className={"mutli-view-viewport-top"}>
          <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        </div>
        <div className={"mutli-view-viewport-bottom"}>
          <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        </div>
      </>
    );
  }
}
