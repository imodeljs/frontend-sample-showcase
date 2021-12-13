/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ViewState } from "@itwin/core-frontend";
import { BasicNavigationWidget, ContentGroup, ContentLayoutDef, CoreTools, Frontstage, FrontstageProps, FrontstageProvider, IModelViewportControl, StagePanel, UiFramework, Widget, Zone } from "@itwin/appui-react";
import React from "react";

export class CrossProbingFrontstage extends FrontstageProvider {
  // constants
  public id = "CrossProbingFrontstage";
  public static MAIN_CONTENT_ID = "CrossProbingFrontstage";
  public static DEFAULT_NAVIGATION_WIDGET_KEY = "DefaultNavigationWidget";
  public static DEFAULT_MANIPULATION_WIDGET_KEY = "DefaultNavigationWidget";
  // Content group for all layouts
  private _contentGroup: ContentGroup;

  constructor(viewState3d: ViewState, viewState2d: ViewState) {
    super();

    const connection = UiFramework.getIModelConnection();

    // Create the content group.
    this._contentGroup = new ContentGroup({
      id: "CrossProbingContentGroup",
      layout: {
        id: "TwoHalvesHorizontal",
        horizontalSplit: { id: "TwoHalvesHorizontalSplit", percentage: 0.50, top: 0, bottom: 1 },
      },
      contents: [
        {
          id: "3dViewportControl",
          classId: IModelViewportControl,
          applicationData: {
            viewState: viewState3d,
            iModelConnection: connection,
          },
        },
        {
          id: "2dViewportControl",
          classId: IModelViewportControl,
          applicationData: {
            viewState: viewState2d,
            iModelConnection: connection,
          },
        },
      ],
    });
  }

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps> {
    return (
      <Frontstage
        id={CrossProbingFrontstage.MAIN_CONTENT_ID}
        defaultTool={CoreTools.selectElementCommand}
        contentGroup={this._contentGroup}
        contentManipulationTools={
          <Zone
            widgets={[
              <Widget
                key={CrossProbingFrontstage.DEFAULT_MANIPULATION_WIDGET_KEY}
                isFreeform={true}
                element={<div />}
              />,
            ]}
          />
        }
        viewNavigationTools={
          <Zone
            widgets={[
              <Widget
                key={CrossProbingFrontstage.DEFAULT_NAVIGATION_WIDGET_KEY}
                isFreeform={true}
                element={<BasicNavigationWidget />}
              />,
            ]}
          />
        }
        bottomPanel={<StagePanel allowedZones={[7, 8, 9]} />}
      />
    );
  }
}
