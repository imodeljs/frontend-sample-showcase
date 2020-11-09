/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import {
  BasicNavigationWidget, BasicToolWidget, ContentGroup, ContentGroupProps, ContentLayoutDef, ContentLayoutProps,
  CoreTools, Frontstage, FrontstageProps, FrontstageProvider, IModelViewportControl, UiFramework, Widget, Zone,
} from "@bentley/ui-framework";
import { StageUsage } from "@bentley/ui-abstract";
import { SmallStatusBarWidgetControl } from "Components/Widgets/SmallStatusBar";

/* eslint-disable react/jsx-key */

// A content layout sets the number and arrangement of content views in a frontstage
const sampleContentLayout: ContentLayoutProps = {
  id: "SampleContentLayout",
};
const sampleLayoutDef: ContentLayoutDef = new ContentLayoutDef(sampleContentLayout);

// a ContentGroup defines the content views in a frontstage
const sampleViewportGroupProps: ContentGroupProps = {
  id: "sampleViewportGroup",
  contents: [
    {
      classId: IModelViewportControl,
      id: "sampleIModelView",
      applicationData: { viewState: UiFramework.getDefaultViewState.bind(UiFramework), iModelConnection: UiFramework.getIModelConnection.bind(UiFramework) }, // Options passed to the ContentControl component
    },
  ],
};
const sampleViewportGroup: ContentGroup = new ContentGroup(sampleViewportGroupProps);
/**
 * Viewport Frontstage for AppUi samples
 */
export class ViewportFrontstage extends FrontstageProvider {

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps> {

    return (
      <Frontstage id="ViewportFrontstage"
        version={1.0}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout={sampleLayoutDef}
        contentGroup={sampleViewportGroup}
        isInFooterMode={true}
        usage={StageUsage.General}
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
