/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React from "react";
import { IModelConnection, ViewState } from "@itwin/core-frontend";
import { BasicNavigationWidget, ContentGroup, ContentLayoutDef, CoreTools, Frontstage, FrontstageProps, FrontstageProvider, IModelViewportControl, StagePanel, UiFramework, Widget, Zone } from "@itwin/appui-react";

export class TransformationsFrontstage extends FrontstageProvider {
  // constants
  public id = "TransformationsFrontstage";
  public static MAIN_CONTENT_ID = "TransformationsFrontstage";
  public static DEFAULT_NAVIGATION_WIDGET_KEY = "DefaultNavigationWidget";
  public static DEFAULT_MANIPULATION_WIDGET_KEY = "DefaultNavigationWidget";
  // Content layout for content views
  private _contentLayoutDef: ContentLayoutDef;
  // Content group for all layouts
  private _contentGroup: ContentGroup;

  // START FRONTSTAGE
  constructor(viewState?: ViewState, viewState2?: ViewState, connection2?: IModelConnection) {
    super();

    this._contentLayoutDef = new ContentLayoutDef({
      id: "TwoHalvesHorizontal",
      horizontalSplit: { id: "TwoHalvesHorizontal", percentage: 0.50, top: 0, bottom: 1 },
    });
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
          id: "TransformationsContents1",
          classId: IModelViewportControl,
          applicationData: {
            viewState,
            iModelConnection: connection,
          },
        },
        {
          id: "TransformationsContents2",
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
        id={TransformationsFrontstage.MAIN_CONTENT_ID}
        defaultTool={CoreTools.selectElementCommand}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
        contentManipulationTools={
          <Zone
            widgets={[
              <Widget
                key={TransformationsFrontstage.DEFAULT_MANIPULATION_WIDGET_KEY}
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
                key={TransformationsFrontstage.DEFAULT_NAVIGATION_WIDGET_KEY}
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
