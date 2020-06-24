/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { GithubLink } from "../../../Components/GithubLink";
import { IModelApp, SelectionTool, } from "@bentley/imodeljs-frontend";

import "../../../common/samples-common.scss";
import { SampleAppUiComponent } from "../common/SampleAppUiComponent";

// The Props and State for this sample component
/** A React component that renders the UI specific for this sample */
export class BasicFrontstageSample extends React.Component {
  public static async setup(_iModelName: string) {
    await SampleAppUiComponent.initialize("SampleFrontstage");
    IModelApp.toolAdmin.defaultToolId = SelectionTool.toolId;

    return <BasicFrontstageSample ></BasicFrontstageSample>;
  }
  public getControlPane() {
    return (
      <>
        <div className="sample-ui">
          <div className="sample-instructions">
            <span>Press the lightbulb icon.</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/basic-frontstage-sample" />
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
            </>
        );
    }
}
