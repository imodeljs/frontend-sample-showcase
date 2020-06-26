/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
// import { ViewState } from "@bentley/imodeljs-frontend";
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
import * as React from "react";
import { SmallStatusBarWidgetControl } from "../Widgets/SmallStatusBar";

/**
 * Sample Frontstage for AppUi samples
 */
export class SampleViewportFrontstage extends FrontstageProvider {

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps>  {

    return (
      <Frontstage id="SampleViewportFrontstage"
        version={1.0}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout="SingleContent"
        contentGroup="singleIModelViewport"
        isInFooterMode={true}
        usage={StageUsage.General}
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
