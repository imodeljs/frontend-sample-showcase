/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { StartupComponent } from "../Startup/Startup";

import "./App.css";
import { SampleShowcase } from "../SampleShowcase/SampleShowcase";
import { ViewSetup } from "../../api/viewSetup";

/** React state for App component */
interface AppState {
  imodel?: IModelConnection;
  viewState?: ViewState;
}

export class App extends React.Component<{}, AppState> {

  /** Creates an App instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {};
  }

  private _onIModelReady = async (imodel: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    this.setState({ imodel, viewState });
  }

  private _onIModelChange = async (imodel: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    this.setState({ imodel, viewState })
  }

  public render() {
    let ui: React.ReactNode;

    if (!this.state.imodel || !this.state.viewState)
      ui = <StartupComponent onIModelReady={this._onIModelReady} />;
    else
      ui = <SampleShowcase imodel={this.state.imodel} viewState={this.state.viewState} onIModelChange={this._onIModelChange} />;

    return (
      <div>
        {ui}
      </div >
    );
  }
}