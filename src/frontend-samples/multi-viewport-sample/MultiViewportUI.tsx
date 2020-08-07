/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { RenderMode } from "@bentley/imodeljs-common";
import { IModelConnection, SelectedViewportChangedArgs, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import { ViewSetup } from "api/viewSetup";
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
  iModel?: IModelConnection;
  view?: ViewState;
}
export interface MultiViewportUIProps {
  iModelName: string;
  setupControlPane: (instructions: string, controls?: React.ReactNode, className?: string) => void;
}

/** A React component that renders the UI specific for this sample */
export default class MultiViewportUI extends React.Component<MultiViewportUIProps, MultiViewportUIState> {

  public state: MultiViewportUIState = { iModel: undefined, view: undefined, isSynced: false, viewports: [] };

  // Handler to show active viewport in the UI by adding styling to it.
  private _setViewportStyling = (args: SelectedViewportChangedArgs) => {
    // Highlight Selected Viewport
    if (args.previous)
      args.previous!.vpDiv.classList.remove("active-viewport");
    if (args.current)
      args.current.vpDiv.classList.add("active-viewport");
    // console.debug("selected");
  }

  // Tracks opened View and adds them to the state.
  private _getViews = (viewport: Viewport) => {
    this.setState({ viewports: [...this.state.viewports, viewport] });
  }

  // Tracks the selected viewport and sets the current to the state.
  private _getSelectedViewport = (args: SelectedViewportChangedArgs) => {
    this.setState({ selectedViewport: args.current });
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
    const selectedViewport = this.state.selectedViewport!;
    const unselectedViewport = this.state.viewports.filter((vp) => vp.viewportId !== selectedViewport?.viewportId)[0];

    if (isOn) {
      MultiViewportApp.connectViewports(selectedViewport, unselectedViewport);
    } else
      MultiViewportApp.disconnectViewports();

    this.setState({ isSynced: isOn });
  }

  // Handle changes to the render mode.
  private _onChangeRenderMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.selectedViewport)
      return;
    const renderMode: RenderMode = Number.parseInt(event.target.value, 10);
    MultiViewportApp.setRenderMode(this.state.selectedViewport, renderMode);
    // Since the render mode is set by the view flags, the viewports needs to be synced before it will be reflected on screen.
    MultiViewportApp.syncViewportWithView(this.state.selectedViewport);
  }

  public getControls(): React.ReactNode {
    const entries = Object.keys(RenderMode)
      .filter((value) => isNaN(Number(value)) === false)
      .map((str: string) => Number(str))
      .map((key) => <option key={key} value={key}>{RenderMode[key]}</option>);

    return (<>
      {/** Selected Viewport independent controls */}
      <div className="sample-options-2col">
        <span>Sync Viewports</span>
        <Toggle disabled={this.state.viewports.length !== 2} isOn={this.state.isSynced} onChange={this._onSyncToggleChange} />
      </div>
      <hr></hr>
      {/** Selected Viewport dependent controls */}
      <div className="sample-options-2col">
        <span>Render Mode</span>
        <select
          disabled={undefined === this.state.selectedViewport}
          value={this.state.selectedViewport?.viewFlags.renderMode}
          style={{ width: "fit-content" }}
          onChange={this._onChangeRenderMode}
        >
          {entries}
        </select>
      </div>
    </>);
  }

  /** The sample's render method */
  public render() {
    this.props.setupControlPane("Do the thing and be amazed", this.getControls());
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
