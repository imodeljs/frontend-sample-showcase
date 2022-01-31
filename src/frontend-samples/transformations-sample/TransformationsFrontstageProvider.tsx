/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import { IModelConnection, ViewState } from "@itwin/core-frontend";
import { BasicNavigationWidget, ContentGroup, CoreTools, Frontstage, FrontstageProps, FrontstageProvider, IModelViewportControl, StagePanel, UiFramework, Widget, Zone } from "@itwin/appui-react";

const DEFAULT_NAVIGATION_WIDGET_KEY = "DefaultNavigationWidget";
const DEFAULT_MANIPULATION_WIDGET_KEY = "DefaultNavigationWidget";

export class TransformationsFrontstage extends FrontstageProvider {

  public id = "TransformationsFrontstage";

  // Content layout for content views
  // Content group for all layouts
  private _contentGroup: ContentGroup;

  // START FRONTSTAGE
  constructor(viewState?: ViewState, viewState2?: ViewState, connection2?: IModelConnection) {
    super();

    const connection = UiFramework.getIModelConnection();

    // Create the content group.
    this._contentGroup = new ContentGroup({
      id: "TransformationsContentGroup",
      layout: {
        id: "TwoHalvesHorizontal",
        horizontalSplit: { id: "TwoHalvesHorizontal", percentage: 0.50, top: 0, bottom: 1 },
      },
      contents: [
        {
          id: "c1",
          classId: IModelViewportControl,
          applicationData: {
            viewState,
            iModelConnection: connection,
          },
        },
        {
          id: "c2",
          classId: IModelViewportControl,
          applicationData: {
            viewState: viewState2,
            iModelConnection: connection2,
          },
        },
      ],
    });
  }
  // END FRONTSTAGE

  /** Define the Frontstage properties */
  public get frontstage(): React.ReactElement<FrontstageProps> {
    return (
      <Frontstage
        id={this.id}
        defaultTool={CoreTools.selectElementCommand}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
        contentManipulationTools={
          <Zone
            widgets={[
              <Widget
                key={DEFAULT_MANIPULATION_WIDGET_KEY}
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
                key={DEFAULT_NAVIGATION_WIDGET_KEY}
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
