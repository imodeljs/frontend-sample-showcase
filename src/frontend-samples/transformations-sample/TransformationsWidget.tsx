/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import MultiViewportApi from "./TransformationsApi";
import { Textarea, Toggle } from "@bentley/ui-core";
import { IModelApp, ViewManip, Viewport } from "@bentley/imodeljs-frontend";
import { useActiveViewport } from "@bentley/ui-framework";
import TransformationsClient from "./TransformationsClient";

const MultiViewportWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [isSynched, setIsSynched] = React.useState<boolean>(true);
  const [initialized, setInitalized] = React.useState<boolean>(false);
  const [transformationResponse, setTransformationResponse] = React.useState<string>("Loading...");

  useEffect(() => {
    void TransformationsClient.getTransformation("e4744f6d-bb08-4932-20e6-08d952925fd1").then((value) => {
      if (value !== undefined)
        setTransformationResponse(JSON.stringify(value, null, 2));
    });
  }, []);

  useEffect(() => {
    if (!initialized && viewport) {
      IModelApp.viewManager.onSelectedViewportChanged.addOnce(() => {
        setInitalized(true);
      });
      for (const vp of IModelApp.viewManager) {
        ViewManip.fitView(vp, false, { noSaveInUndo: true });
      }
    }
  }, [initialized, viewport]);

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
      MultiViewportApi.connectViewports(selectedViewport, unselectedViewport);
    } else if (!isSynched) {
      MultiViewportApi.disconnectViewports();
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

export class MultiViewportWidgetProvider implements UiItemsProvider {
  public readonly id: string = "MultiViewportWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "MultiViewportWidget",
          label: "Multi Viewport Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <MultiViewportWidget />,
        }
      );
    }
    return widgets;
  }
}
