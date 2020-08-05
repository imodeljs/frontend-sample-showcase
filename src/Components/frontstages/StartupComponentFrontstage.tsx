/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import {
  BasicNavigationWidget,
  BasicToolWidget,
  CoreTools,
  Frontstage,
  FrontstageProps,
  FrontstageProvider,
  Widget,
  Zone,
} from "@bentley/ui-framework";
import { StageUsage } from "@bentley/ui-abstract";
import { SmallStatusBarWidgetControl } from "../Widgets/SmallStatusBar";

/**
 * Startup Component Stage for AppUi samples
 */
export class StartupComponentFrontstage extends FrontstageProvider {

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps>  {

    return (
      <Frontstage id="StartupComponentFrontstage"
        version={1.0}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout="SingleContent"
        contentGroup="startupComponent"
        isInFooterMode={true}
        usage={StageUsage.Private}
        applicationData={{ key: "value" }}

        contentManipulationTools={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={<BasicToolWidget/>} />,
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
              <Widget isFreeform={true} element={<BasicNavigationWidget/>} />,
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
