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

/**
 * Sample Frontstage for AppUi samples
 */
export class SampleFrontstage extends FrontstageProvider {

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps>  {

    return (
      <Frontstage id="SampleFrontstage"
        version={1.0}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout="SingleContent"
        contentGroup="singleIModelViewport"
        isInFooterMode={true}
        usage={StageUsage.General}
        applicationData={{ key: "value" }}

        viewNavigationTools={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={this.getNavigationWidget()} />,
            ]}
          />
        }
      />
    );
  }

  /** Define a NavigationWidget with Buttons to display in the TopRight zone.
   */
  private getNavigationWidget(): React.ReactNode {
    return (
      <BasicNavigationWidget/>
    );
  }
}
