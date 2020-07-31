/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import "common/samples-common.scss";
import { ViewportComponent } from "@bentley/ui-components";
import { IModelConnection, IModelApp, Viewport, TwoWayViewportSync, SelectedViewportChangedArgs, ViewState } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import "./multi-view-sample.scss";
import { ViewSetup } from "api/viewSetup";

// const SampleViewport = viewWithUnifiedSelection(ViewportComponent);

export interface MultiViewportUIState {
  vp?: Viewport;
  view?: ViewState;
  isSynced: boolean;
}
export interface MultiViewportUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

export default class MultiViewportUI extends React.Component<MultiViewportUIProps, MultiViewportUIState> {

  public twoWaySync: TwoWayViewportSync = new TwoWayViewportSync();
  public state: MultiViewportUIState = { vp: undefined, isSynced: false };

  public componentWillUnmount() {
    IModelApp.viewManager.onSelectedViewportChanged.removeListener(this._onSelectedViewportChange);
    this.twoWaySync.disconnect();
  }

  private _onIModelReady = (iModel: IModelConnection) => {
    ViewSetup.getDefaultView(iModel).then((view) => {
      this.setState({ view });
    }).catch();
    IModelApp.viewManager.onSelectedViewportChanged.addListener(this._onSelectedViewportChange);
    const vp = IModelApp.viewManager.selectedView;
    if (vp) {
      vp.vpDiv.classList.add("active-viewport");
      this.setState({ vp });
    } else
      IModelApp.viewManager.onViewOpen.addOnce((args) => {
        args.vpDiv.classList.add("active-viewport");
        this.setState({ vp: args });
      });
  }

  private _onChange = (isOn: boolean) => {
    const vps: Viewport[] = [];
    IModelApp.viewManager.forEachViewport((vp) => {
      vps.push(vp);
    });
    if (vps.length < 2) {
      console.error(`Less Viewports than expected: (2) - Actual: (${vps.length})`);
      this.setState({ isSynced: !isOn });
      return;
    } else if (vps.length > 2) {
      console.error(`More Viewports than expected: (2) - Actual: (${vps.length})`);
    }
    if (isOn) {
      this.twoWaySync.connect(vps[0], vps[1]);
      vps.forEach((vp) => vp.invalidateScene());
    } else
      this.twoWaySync.disconnect();

    this.setState({ isSynced: isOn });
  }
  private _onSelectedViewportChange = (args: SelectedViewportChangedArgs) => {
    if (args.previous)
      args.previous!.vpDiv.classList.remove("active-viewport");
    if (args.current)
      args.current.vpDiv.classList.add("active-viewport");
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        { /* Viewport to display the iModel */}
        <div className={"mutli-view-viewport-top"}>
          <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        </div>
        <div className={"mutli-view-viewport-bottom"}>
          {/* {undefined !== this.state.vp ? <ViewportComponent imodel={this.state.vp.iModel} viewState={this.state.vp.view} /> : <></>} */}
          {undefined !== this.state.vp && undefined !== this.state.view ? <ViewportComponent imodel={this.state.vp.iModel} viewState={this.state.view} /> : <></>}
        </div>

        { /* The control pane */}
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Use the toolbar at the top-right to navigate the model.</span>
          </div>
          {this.props.iModelSelector}
          <hr></hr>
          <div className="sample-options-2col">
            <span>Sync Viewports</span>
            <Toggle isOn={this.state.isSynced} onChange={this._onChange} />
          </div>
        </div>
      </>
    );
  }
}
