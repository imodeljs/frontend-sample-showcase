/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BasicNavigationWidget, BasicToolWidget, ContentGroup, ContentGroupProps, CoreTools, Frontstage, FrontstageProps, FrontstageProvider, IModelViewportControl, UiFramework, Widget, Zone } from "@itwin/appui-react";
import { StageUsage } from "@itwin/appui-abstract";
import { SmallStatusBarWidgetControl } from "../Widgets/SmallStatusBar";

/* eslint-disable react/jsx-key */
// a ContentGroup defines the content views in a frontstage
const StartupComponentGroupProps: ContentGroupProps = {
  id: "StartupComponentGroup",
  layout: {
    id: "SingleContent",
  },
  contents: [
    {
      classId: IModelViewportControl,
      id: "StartupComponentContents",
      applicationData: { viewState: UiFramework.getDefaultViewState.bind(UiFramework), iModelConnection: UiFramework.getIModelConnection.bind(UiFramework) }, // Options passed to the ContentControl component
    },
  ],
};
const startupComponentGroup: ContentGroup = new ContentGroup(StartupComponentGroupProps);

/**
 * Startup Component Stage for AppUi samples
 */
export class StartupComponentFrontstage extends FrontstageProvider {
  public id = "StartupComponentFrontstageProvider";
  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps> {

    return (
      <Frontstage id="StartupComponentFrontstage"
        version={1.0}
        defaultTool={CoreTools.selectElementCommand}
        contentGroup={startupComponentGroup}
        isInFooterMode={true}
        usage={StageUsage.Private}
        applicationData={{ key: "value" }}

        contentManipulationTools={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<BasicToolWidget />} />,
            ]}
          />
        }
        toolSettings={
          <Zone
            widgets={[
              <Widget isToolSettings={true} />,
            ]}
          />
        }
        viewNavigationTools={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<BasicNavigationWidget />} />,
            ]}
          />
        }
        statusBar={
          < Zone
            widgets={
              [
                <Widget isStatusBar={true} control={SmallStatusBarWidgetControl} />,
              ]}
          />
        }
      />
    );
  }
}
