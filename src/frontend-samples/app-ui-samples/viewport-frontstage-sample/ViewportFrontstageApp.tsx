/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../../common/samples-common.scss";
import "../../../common/AppUi/app-ui.scss";
import { SampleAppUiComponent } from "../../../common/AppUi/SampleAppUiComponent";
import { AppUi } from "../../../common/AppUi/AppUi";

// The Props and State for this sample component
/** A React component that renders the UI specific for this sample */
export class ViewportFrontstageSample extends React.Component<{ setupControlPane: (instructions: string, controls?: React.ReactNode, className?: string) => void }> {
  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode, className?: string) => void) {
    // Initialize utility class for AppUi samples
    AppUi.initialize();
    // set up iModel and AppUi Frontstage
    await AppUi.setIModelAndFrontstage(iModelName, "ViewportFrontstage");
    return <ViewportFrontstageSample setupControlPane={setupControlPane}></ViewportFrontstageSample>;
  }
  public static teardown() {
    AppUi.restoreDefaults();
  }

  /** The sample's render method */
  public render() {
    this.props.setupControlPane("A basic frontstage using the IModelViewportContentControl in UI Framework.", undefined, "app-ui");
    return (
      <>
        <SampleAppUiComponent></SampleAppUiComponent>
      </>
    );
  }
}
