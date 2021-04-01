/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ViewState } from "@bentley/imodeljs-frontend";
import { BasicNavigationWidget, BasicToolWidget, ContentGroup, ContentLayoutDef, CoreTools, Frontstage, FrontstageProvider, IModelViewportControl, StagePanel, UiFramework, Widget, Zone } from "@bentley/ui-framework";
import React from "react";

export class CrossProbingFrontstage extends FrontstageProvider {
  // constants
  public static MAIN_CONTENT_ID = "CrossProbingFrontstage";
  public static DEFAULT_NAVIGATION_WIDGET_KEY = "DefaultNavigationWidget";
  public static DEFAULT_MANIPULATION_WIDGET_KEY = "DefaultNavigationWidget";
  // Content layout for content views
  private _contentLayoutDef: ContentLayoutDef;
  // Content group for all layouts
  private _contentGroup: ContentGroup;

  constructor(viewState3d: ViewState, viewState2d: ViewState) {
    super();

    this._contentLayoutDef = new ContentLayoutDef({
      id: "TwoHalvesHorizontal",
      priority: 60,
      horizontalSplit: { percentage: 0.50, top: 0, bottom: 1 },
    });

    // Create the content group.
    this._contentGroup = new ContentGroup({
      contents: [
        {
          classId: IModelViewportControl,
          applicationData: {
            viewState: viewState3d,
            iModelConnection: UiFramework.getIModelConnection(),
          },
        },
        {
          classId: IModelViewportControl,
          applicationData: {
            viewState: viewState2d,
            iModelConnection: UiFramework.getIModelConnection(),
          },
        },
      ],
    });
  }

  /** Define the Frontstage properties */
  public get frontstage() {
    return (
      <Frontstage
        id={CrossProbingFrontstage.MAIN_CONTENT_ID}
        defaultTool={CoreTools.selectElementCommand}
        defaultLayout={this._contentLayoutDef}
        contentGroup={this._contentGroup}
        isInFooterMode={true}
        contentManipulationTools={
          <Zone
            widgets={[
              <Widget
                key={CrossProbingFrontstage.DEFAULT_MANIPULATION_WIDGET_KEY}
                isFreeform={true}
                element={<BasicToolWidget />}
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
