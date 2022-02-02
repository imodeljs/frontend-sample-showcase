/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { Button, Select, ToggleSwitch } from "@itwin/itwinui-react";
import { ContextRotationId, IModelApp } from "@itwin/core-frontend";
import ViewClipApi from "./ViewClipApi";
import { useActiveIModelConnection, useActiveViewport } from "@itwin/appui-react";
import { ClipShape, ConvexClipPlaneSet } from "@itwin/core-geometry";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import "./ViewClip.scss";

export const ViewClipWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const viewport = useActiveViewport();
  const [showClipBlockState, setShowClipBlockState] = React.useState<boolean>(true);
  const [clipPlaneState, setClipPlaneState] = React.useState<string>("None");

  useEffect(() => {
    if (undefined === viewport || undefined === iModelConnection) {
      return;
    }

    if (clipPlaneState === "None" && !showClipBlockState) {
      ViewClipApi.clearClips(viewport);
      return;
    }

    if (showClipBlockState) {
      ViewClipApi.addExtentsClipRange(viewport);
      return;
    }

    ViewClipApi.setClipPlane(viewport, clipPlaneState, iModelConnection);
  }, [showClipBlockState, clipPlaneState, iModelConnection, viewport]);

  /* Handler for plane select */
  const _onPlaneSelectChange = (selectedPlane: string) => {
    setShowClipBlockState(false);
    setClipPlaneState(selectedPlane);
  };

  /* Turn on/off the clip range */
  const _onToggleRangeClip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setShowClipBlockState(e.target.checked);
    setClipPlaneState("None");
  };

  /* Method for flipping (negating) the current clip plane. */
  const _handleFlipButton = () => {
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return false;
    }
    // Get the existing clip
    const existingClip = vp.view.getViewClip();
    let planeSet: ConvexClipPlaneSet | undefined;
    if (undefined !== existingClip && 1 === existingClip.clips.length) {
      const existingPrim = existingClip.clips[0];
      if (!(existingPrim instanceof ClipShape)) {
        const existingPlaneSets = existingPrim.fetchClipPlanesRef();
        if (undefined !== existingPlaneSets && 1 === existingPlaneSets.convexSets.length) {
          planeSet = existingPlaneSets.convexSets[0];
          // Negate the planeSet
          planeSet.negateAllPlanes();
          // This method calls setViewClip. Note that editing the existing clip was not sufficient. The existing clip was edited then passed back to setViewClip.
          return ViewClipApi.setViewClipFromClipPlaneSet(vp, planeSet);
        }
      }
    }
    return true;
  };

  const options = [
    { value: "None", label: "None" },
    { value: [ContextRotationId.Left].toString(), label: "X" },
    { value: [ContextRotationId.Front].toString(), label: "Y" },
    { value: [ContextRotationId.Top].toString(), label: "Z" },
  ];

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-3col even-3col">
          <span>Clip Range</span>
          <ToggleSwitch checked={showClipBlockState} onChange={_onToggleRangeClip} />
          <span />
          <span>Clip Plane</span>
          <Select<string> onChange={_onPlaneSelectChange} value={clipPlaneState} options={options} onShow={() => { }} onHide={() => { }} />
          <Button onClick={() => _handleFlipButton()} disabled={clipPlaneState === "None"} styleType='cta'>Flip</Button>
        </div>
      </div>
    </>
  );
};

export class ViewClipWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ViewClipWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ViewClipWidget",
          label: "View Clip Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ViewClipWidget />,
        },
      );
    }
    return widgets;
  }
}
