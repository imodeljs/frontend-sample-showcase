/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ConfigurableCreateInfo, ContentControl, FrontstageManager, FrontstageActivatedEventArgs, UiFramework, ConfigurableUiManager } from "@bentley/ui-framework";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ViewSetup } from "../../api/viewSetup";
import { StartupComponent } from "../../Components/Startup/Startup";
import React from "react";
import { AppUi } from "./AppUi";

export interface StartupControlProps {
  iModelName: string;
  frontstageId: string;
}

export class StartupComponentContentControl extends ContentControl {

  public static get id() {
    return "SampleShowcase.StartupComponentControl";
  }

  constructor(info: ConfigurableCreateInfo, protected _options: StartupControlProps) {
    super(info, _options);

  }
  public onInitialize() {
    super.onInitialize();
    this.reactNode = this.getReactNode();
  }
  public getReactNode(): React.ReactNode {
    const newIModelName = AppUi.iModelName;
    if (undefined !== newIModelName)
      return (<StartupComponent iModelName={newIModelName} onIModelReady={this._onIModelReady} />);

  }
  private _onIModelReady = async (imodel: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    UiFramework.setIModelConnection(imodel);
    UiFramework.setDefaultViewState(viewState);
    await AppUi.setFrontstage(AppUi.iModelName, AppUi.frontstageId);
  }
}

ConfigurableUiManager.registerControl(StartupComponentContentControl.id, StartupComponentContentControl);