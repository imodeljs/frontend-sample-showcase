/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ViewState } from "@bentley/imodeljs-frontend";
import {
  ContentGroup,
  CoreTools,
  Frontstage,
  FrontstageProps,
  FrontstageProvider,
  IModelViewportControl,
  UiFramework,
  Widget,
  Zone,
  BasicNavigationWidget,
  BasicToolWidget,
} from "@bentley/ui-framework";
import * as React from "react";
import { AppUi } from "../App/AppUi";

/**
 * Sample Frontstage for AppUi samples
 */
export class SampleFrontstage extends FrontstageProvider {

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps>  {

    const myContentGroup: ContentGroup = new ContentGroup(
      {
        contents: [
          {
            id: "primaryContent",
            classId: IModelViewportControl,
            applicationData: {
              viewState: UiFramework.getDefaultViewState,
              iModelConnection: UiFramework.getIModelConnection,
            },
          },
        ],
      },
    );


    return (
      <Frontstage id="SampleFrontstage"
        version={1.0}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout="SingleContent"
        contentGroup={myContentGroup}
        isInFooterMode={true}
        defaultContentId="TestContent1"

        contentManipulationTools={
          <Zone
            widgets={[
              <Widget isFreeform={true} element={this.getToolWidget()} />,
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
              <Widget isFreeform={true} element={this.getNavigationWidget()} />,
            ]}
          />
        }
      />
    );
  }
  /** Define a ToolWidget with Buttons to display in the TopLeft zone. */
  private getToolWidget(): React.ReactNode {
    return (
      <BasicToolWidget/>
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
