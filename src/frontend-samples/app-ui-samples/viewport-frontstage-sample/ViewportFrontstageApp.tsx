/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/AppUi/app-ui.scss";
import { SampleAppUiComponent } from "common/AppUi/SampleAppUiComponent";
import { AppUi } from "common/AppUi/AppUi";
import { ControlPane } from "common/ControlPane/ControlPane";

// The Props and State for this sample component
/** A React component that renders the UI specific for this sample */
export class ViewportFrontstageSample extends React.Component<{ iModelSelector: React.ReactNode }> {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    // Initialize utility class for AppUi samples
    AppUi.initialize();
    // set up iModel and AppUi Frontstage
    await AppUi.setIModelAndFrontstage(iModelName, "ViewportFrontstage");
    return <ViewportFrontstageSample iModelSelector={iModelSelector}></ViewportFrontstageSample>;
  }
  public static teardown() {
    AppUi.restoreDefaults();
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <div className="app-ui">
          <ControlPane instructions="A basic frontstage using the IModelViewportContentControl in UI Framework." iModelSelector={this.props.iModelSelector}></ControlPane>
        </div>
        <SampleAppUiComponent></SampleAppUiComponent>
      </>
    );
  }
}
