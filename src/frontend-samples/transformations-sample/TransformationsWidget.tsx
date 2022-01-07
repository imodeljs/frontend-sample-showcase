/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import TransformationsApi from "./TransformationsApi";
import { Textarea, Toggle } from "@itwin/core-react";
import { IModelApp, ViewManip, Viewport } from "@itwin/core-frontend";
import { useActiveFrontstageId, useActiveViewport } from "@itwin/appui-react";
import TransformationsClient from "./TransformationsClient";

const TransformationsWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [isSynched, setIsSynched] = React.useState<boolean>(true);
  // const [initialized, setInitalized] = React.useState<boolean>(false);
  const [transformationResponse, setTransformationResponse] = React.useState<string>("Loading...");
  const frontstageId = useActiveFrontstageId();

  useEffect(() => {
    (async () => {
      const transformationResp = await TransformationsClient.getTransformation(TransformationsApi.Transformation_Id);

      if (transformationResp !== undefined)
        setTransformationResponse(JSON.stringify(transformationResp, null, 2));
      else
        setTransformationResponse("Invalid Response");
    })()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, []);

  useEffect(() => {
    if (viewport) {
      for (const vp of IModelApp.viewManager) {
        if (vp.viewportId % 2 === 0)
          requestAnimationFrame(() => ViewManip.fitView(vp, false, { noSaveInUndo: true }));
      }
    }
  }, [viewport, frontstageId]);

  // START SYNC
  // Handle changes to the UI sync toggle.
  useEffect(() => {
    if (isSynched && viewport !== undefined) {
      let selectedViewport: Viewport | undefined, unselectedViewport: Viewport | undefined;
      for (const vp of IModelApp.viewManager) {
        if (vp.viewportId === viewport.viewportId)
          selectedViewport = vp;
        else
          unselectedViewport = vp;
      }
      if (selectedViewport === undefined || unselectedViewport === undefined)
        return;
      TransformationsApi.connectViewports(selectedViewport, unselectedViewport);
    } else if (!isSynched) {
      TransformationsApi.disconnectViewports();
    }
  }, [viewport, isSynched]);
  // END SYNC

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-options-2col">
        <span>Sync Viewports</span>
        <Toggle disabled={viewport === undefined} isOn={isSynched} onChange={(on) => setIsSynched(on)} />
      </div>
      <div style={{ marginTop: "8px" }}>
        <span>Get Transformation Response:</span>
        <Textarea spellCheck={"false"} className="uicore-full-width" style={{ overflow: "scroll", height: "12rem", resize: "none" }} value={transformationResponse} />
      </div>
    </div>
  );
};

export class TransformationsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "TransformationsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "TransformationsWidget",
          label: "Transformations Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <TransformationsWidget />,
        },
      );
    }
    return widgets;
  }
}
