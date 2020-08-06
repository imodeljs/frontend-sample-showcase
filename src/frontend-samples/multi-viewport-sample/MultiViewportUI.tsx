/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { RenderMode } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, Viewport, ViewState, SelectedViewportChangedArgs } from "@bentley/imodeljs-frontend";
import { ViewportComponent } from "@bentley/ui-components";
import { Toggle } from "@bentley/ui-core";
import { ViewSetup } from "api/viewSetup";
import "common/samples-common.scss";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import "./multi-view-sample.scss";
import MultiViewportApp from "./MultiViewportApp";

export interface MultiViewportUIState {
  isSynced: boolean;
  viewports: Viewport[];
  selectedViewport?: Viewport;
  iModel?: IModelConnection;
  view?: ViewState;
}
export interface MultiViewportUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

export default class MultiViewportUI extends React.Component<MultiViewportUIProps, MultiViewportUIState> {

  public state: MultiViewportUIState = { iModel: undefined, view: undefined, isSynced: false, viewports: [] };

  constructor(props: MultiViewportUIProps, context: any) {
    super(props, context);
    MultiViewportApp.listenForSelectedViewportChange(this._setViewportStyling);
    MultiViewportApp.listenForSelectedViewportChange(this._getSelectedViewport);
    MultiViewportApp.listenForViewOpened(this._getViewports);
  }

  public componentDidUpdate(prevProps: MultiViewportUIProps, prevState: MultiViewportUIState) {
    if (undefined === prevState.iModel && undefined !== this.state.iModel)
      // Get default View for the iModel to load the second viewport
      ViewSetup.getDefaultView(this.state.iModel).then((view) => {
        this.setState({ view });
      }).catch();

  }

  private _setViewportStyling = (args: SelectedViewportChangedArgs) => {
    // Highlight Selected Viewport
    if (args.previous)
      args.previous!.vpDiv.classList.remove("active-viewport");
    if (args.current)
      args.current.vpDiv.classList.add("active-viewport");
  }

  private _getViewports = (viewport: Viewport) => {
    this.setState({ viewports: [...this.state.viewports, viewport] });
  }

  private _getSelectedViewport = (args: SelectedViewportChangedArgs) => {
    this.setState({ selectedViewport: args.current });
  }

  // Sets up parts of the app for after the iModel is loaded.
  private _onIModelReady = (iModel: IModelConnection) => {
    this.setState({ iModel });
  }

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
    MultiViewportApp.syncViewportWithView(this.state.selectedViewport);
  }

  /** The sample's render method */
  public render() {
    const entries = Object.keys(RenderMode)
      .filter((value) => isNaN(Number(value)) === false)
      .map((str: string) => Number(str))
      .map((key) => <option key={key} value={key}>{RenderMode[key]}</option>);

    return (
      <>
        { /* Viewport to display the iModel */}
        <div className={"mutli-view-viewport-top"}>
          <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        </div>
        <div className={"mutli-view-viewport-bottom"}>
          {undefined !== this.state.iModel && undefined !== this.state.view ? <ViewportComponent imodel={this.state.iModel} viewState={this.state.view} /> : <></>}
        </div>

        { /* The control pane */}
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Use the toolbar at the top-right to navigate the model.</span>
          </div>
          {this.props.iModelSelector}
          <hr></hr>
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
        </div>
      </>
    );
  }
}
