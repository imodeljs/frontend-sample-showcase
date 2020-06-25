/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, SelectionTool, } from "@bentley/imodeljs-frontend";

import "../../../common/samples-common.scss";
import { SampleAppUiComponent } from "../common/SampleAppUiComponent";

// The Props and State for this sample component
/** A React component that renders the UI specific for this sample */
export class ViewportFrontstageSample extends React.Component {
  public static async setup(_iModelName: string) {
    await SampleAppUiComponent.initialize("ViewportFrontstage");
    IModelApp.toolAdmin.defaultToolId = SelectionTool.toolId;

    return <ViewportFrontstageSample ></ViewportFrontstageSample>;
  }
  public static teardown() {

  }
  public getControlPane() {
    return (
      <>
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Press the lightbulb icon.</span>
          </div>
          <hr></hr>
          <div>The lightbulb icon is an added tool button.</div>
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
