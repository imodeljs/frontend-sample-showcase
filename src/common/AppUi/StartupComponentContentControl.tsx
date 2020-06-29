/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ConfigurableCreateInfo, ContentControl, UiFramework, ConfigurableUiManager } from "@bentley/ui-framework";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ViewSetup } from "../../api/viewSetup";
import { StartupComponent, StartupProps } from "../../Components/Startup/Startup";
import React from "react";

class StartupComponentContentControl extends ContentControl {
  public static get id() {
    return "SampleShowcase.StartupComponentControl";
  }

  constructor(info: ConfigurableCreateInfo, protected _options: StartupProps) {
    super(info, _options);
    this.reactNode = this.getReactNode();
  }

  public getReactNode(): React.ReactNode {
    return (<StartupComponent iModelName={this._options.iModelName} onIModelReady={this._onIModelReady} />);

  }
  private _onIModelReady = async (imodel: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    // this.setState({ imodel, viewState }, () => { if (this._options.onIModelReady) this.props.onIModelReady(imodel); });
    UiFramework.setIModelConnection(imodel);
    UiFramework.setDefaultViewState(viewState);
  }
}

export { StartupComponentContentControl };
ConfigurableUiManager.registerControl (StartupComponentContentControl.id, StartupComponentContentControl);