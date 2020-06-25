/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, SelectionTool, } from "@bentley/imodeljs-frontend";
import { UiItemsManager } from "@bentley/ui-abstract";
import { BasicToolbarButtonProvider } from "./BasicToolbarButtonProvider";
import { UiFramework } from "@bentley/ui-framework";
import "../../../common/samples-common.scss";
import { SampleAppUiComponent } from "../common/SampleAppUiComponent";

// The Props and State for this sample component
/** A React component that renders the UI specific for this sample */
export class BasicFrontstageSample extends React.Component {
  public static uiProvider?: BasicToolbarButtonProvider;
  public static async setup(_iModelName: string) {
    if (this.uiProvider === undefined)
      this.uiProvider = new BasicToolbarButtonProvider();
    UiItemsManager.register(this.uiProvider);

    await SampleAppUiComponent.initialize("SampleFrontstage");
    IModelApp.toolAdmin.defaultToolId = SelectionTool.toolId;
    UiFramework.setColorTheme("dark");
    return <BasicFrontstageSample ></BasicFrontstageSample>;
  }
  public static teardown() {
    if (this.uiProvider !== undefined)
      UiItemsManager.unregister(this.uiProvider.id);
  }
  public getControlPane() {
    return (
      <>
        <div className="sample-ui">
          <span>Fit View icon added to the tool bar.</span>
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
