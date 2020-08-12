/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { UiItemsManager } from "@bentley/ui-abstract";
import { ToolbarButtonProvider } from "./ToolbarButtonUi";
import "../../../common/samples-common.scss";
import "../../../common/AppUi/app-ui.scss";
import { SampleAppUiComponent } from "../../../common/AppUi/SampleAppUiComponent";
import { AppUi } from "../../../common/AppUi/AppUi";
import SampleApp from "../../../common/SampleApp";

// The Props and State for this sample component
/** A React component that renders the UI specific for this sample */
export class ToolbarButtonSample extends React.Component<{ setupControlPane: (instructions: string, controls?: React.ReactNode, className?: string) => void }> implements SampleApp {
  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode, className?: string) => void) {
    // Initialize utility class for AppUi samples
    AppUi.initialize();
    // Register provider for to AppUi for toolbar items
    if (undefined === UiItemsManager.getUiItemsProvider("ToolbarButtonProvider"))
      UiItemsManager.register(new ToolbarButtonProvider());

    // set up iModel and AppUi Frontstage
    await AppUi.setIModelAndFrontstage(iModelName, "ViewportFrontstage");
    return <ToolbarButtonSample setupControlPane={setupControlPane}></ToolbarButtonSample>;
  }
  public static teardown() {
    if (undefined !== UiItemsManager.getUiItemsProvider("ToolbarButtonProvider"))
      UiItemsManager.unregister("ToolbarButtonProvider");
    AppUi.restoreDefaults();
  }

  public componentDidMount() {
    this.props.setupControlPane("Press the Lightbulb button tool at the top of the screen.", undefined, "app-ui");
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
