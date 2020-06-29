/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, SelectionTool, } from "@bentley/imodeljs-frontend";
import { UiItemsManager } from "@bentley/ui-abstract";
import { ToolbarButtonProvider } from "./ToolbarButtonProvider";
import "../../../common/samples-common.scss";
import { SampleAppUiComponent } from "../../../common/AppUi/SampleAppUiComponent";
import { AppUi } from "../../../common/AppUi/AppUi";

// The Props and State for this sample component
/** A React component that renders the UI specific for this sample */
export class ToolbarButtonSample extends React.Component {
  public static uiProvider?: ToolbarButtonProvider;
  public static async setup(_iModelName: string) {
    AppUi.setIModelName(_iModelName);

    if (this.uiProvider === undefined)
      this.uiProvider = new ToolbarButtonProvider();
    UiItemsManager.register(this.uiProvider);

    await SampleAppUiComponent.initialize("SampleViewportFrontstage");
    IModelApp.toolAdmin.defaultToolId = SelectionTool.toolId;
    return <ToolbarButtonSample ></ToolbarButtonSample>;
  }
  public static teardown() {
    if (this.uiProvider !== undefined)
      UiItemsManager.unregister(this.uiProvider.id);
  }
  public getControlPane() {
    return (
      <>
        <div className="sample-ui">
          <span>Press the Lightbulb button tool at the top of the screen.</span>
        </div>
      </>
    );
  }


  /** The sample's render method */
  public render() {
    return (
      <>
        <SampleAppUiComponent></SampleAppUiComponent>
        {this.getControlPane()}
      </>
    );
  }
}
