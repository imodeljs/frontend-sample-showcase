/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { UiItemsManager } from "@bentley/ui-abstract";
import { ToolbarButtonProvider } from "./ToolbarButtonUi";
import "common/samples-common.scss";
import "common/AppUi/app-ui.scss";
import { SampleAppUiComponent } from "common/AppUi/SampleAppUiComponent";
import { AppUi } from "common/AppUi/AppUi";
import { ControlPane } from "common/ControlPane/ControlPane";

// The Props and State for this sample component
/** A React component that renders the UI specific for this sample */
export default class ToolbarButtonSample extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }> {
  // eslint-disable-next-line react/no-deprecated
  public async componentWillMount() {
    // Initialize utility class for AppUi samples
    AppUi.initialize();
    // Register provider for to AppUi for toolbar items
    if (undefined === UiItemsManager.getUiItemsProvider("ToolbarButtonProvider"))
      UiItemsManager.register(new ToolbarButtonProvider());

    // set up iModel and AppUi Frontstage
    await AppUi.setIModelAndFrontstage(this.props.iModelName, "ViewportFrontstage");
  }

  public async componentDidUpdate() {
    // Initialize utility class for AppUi samples
    AppUi.initialize();
    // Register provider for to AppUi for toolbar items
    if (undefined === UiItemsManager.getUiItemsProvider("ToolbarButtonProvider"))
      UiItemsManager.register(new ToolbarButtonProvider());

    // set up iModel and AppUi Frontstage
    await AppUi.setIModelAndFrontstage(this.props.iModelName, "ViewportFrontstage");
  }

  public componentWillUnmount() {
    if (undefined !== UiItemsManager.getUiItemsProvider("ToolbarButtonProvider"))
      UiItemsManager.unregister("ToolbarButtonProvider");
    AppUi.restoreDefaults();
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <div className="app-ui">
          <ControlPane instructions="Press the Lightbulb button tool at the top of the screen." iModelSelector={this.props.iModelSelector}></ControlPane>
        </div>
        <SampleAppUiComponent></SampleAppUiComponent>
      </>
    );
  }
}
