/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelConnection, ViewState } from "@itwin/core-frontend";
import { BasicNavigationWidget, ContentGroup, CoreTools, Frontstage, FrontstageProps, FrontstageProvider, IModelViewportControl, StagePanel, Widget, Zone } from "@itwin/appui-react";
import React from "react";

export class CrossProbingFrontstageProvider extends FrontstageProvider {
  // constants
  public id = "CrossProbingFrontstage";
  public static MAIN_CONTENT_ID = "CrossProbingFrontstage";
  public static DEFAULT_NAVIGATION_WIDGET_KEY = "DefaultNavigationWidget";
  public static DEFAULT_MANIPULATION_WIDGET_KEY = "DefaultNavigationWidget";
  // Content group for all layouts
  private _contentGroup: ContentGroup;

  constructor(connection: IModelConnection, viewState3d: ViewState, viewState2d: ViewState) {
    super();

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
        id={CrossProbingFrontstageProvider.MAIN_CONTENT_ID}
        defaultTool={CoreTools.selectElementCommand}
        contentGroup={this._contentGroup}
        contentManipulationTools={
          <Zone
            widgets={[
              <Widget
                key={CrossProbingFrontstageProvider.DEFAULT_MANIPULATION_WIDGET_KEY}
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
                key={CrossProbingFrontstageProvider.DEFAULT_NAVIGATION_WIDGET_KEY}
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
