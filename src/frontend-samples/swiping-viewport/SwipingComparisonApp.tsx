/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, mapLayerOptions, SampleIModels, useSampleWidget, ViewSetup } from "@itwin/sandbox";
import React, { FunctionComponent, useEffect, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelApp, IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { IModelViewportControlOptions } from "@itwin/appui-react";
import { SwipingComparisonWidgetProvider } from "./SwipingComparisonWidget";
import { DividerComponent } from "./Divider";
import SwipingComparisonApi from "./SwipingComparisonApi";

const uiProviders = [new SwipingComparisonWidgetProvider()];

const SwipingComparisonApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Drag the divider to compare the two halves of the view. Try rotating the view with the 'Lock Plane' toggle on and off.", [SampleIModels.ExtonCampus]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();
  const [boundsState, setBoundsState] = React.useState<ClientRect>();
  const [dividerLeftState, setDividerLeftState] = React.useState<number>();
  const [isLockedState, setIsLockedState] = React.useState<boolean>(false);

  /** On function component initialization, subscribe to the locked event for when the widget toggles a locked the state is updated */
  useEffect(() => {
    const unSubscribe = SwipingComparisonApi.onLockEvent.addListener((isLocked) => setIsLockedState(isLocked));
    return () => { unSubscribe(); };
  }, []);

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((_vp: ScreenViewport) => {
      setBoundsState(SwipingComparisonApi.getClientRect(_vp));
      const dividerPos = initPositionDivider(SwipingComparisonApi.getClientRect(_vp));
      setDividerLeftState(dividerPos);
    });
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    setViewportOptions({ viewState });
  };

  // Returns the position the divider will start at based on the bounds of the divider
  const initPositionDivider = (bounds: ClientRect): number => {
    return bounds.left + (bounds.width / 2);
  };

  const _onDividerMoved = (leftWidth: number, rightWidth: number) => {
    // leftWidth is relative to the canvas.  We need to track left based on the window
    const sliderWidth = boundsState!.width - (leftWidth + rightWidth);
    const left = leftWidth + (sliderWidth / 2);
    const updatedLeft = left + boundsState!.left;

    // Raise the event to be sent to the widget
    SwipingComparisonApi.onSwipeEvent.raiseEvent(updatedLeft);
    setDividerLeftState(updatedLeft);
  };

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <>
          <Viewer
            iTwinId={sampleIModelInfo.contextId}
            iModelId={sampleIModelInfo.iModelId}
            authClient={AuthorizationClient.oidcClient}
            enablePerformanceMonitors={true}
            viewportOptions={viewportOptions}
            mapLayerOptions={mapLayerOptions}
            onIModelConnected={_oniModelReady}
            defaultUiConfig={default3DSandboxUi}
            theme="dark"
            uiProviders={uiProviders}
          />

          {/** The divider to move left and right. */}
          {boundsState && dividerLeftState && !isLockedState ?
            <DividerComponent sideL={dividerLeftState - boundsState.left} bounds={boundsState} onDragged={_onDividerMoved} />
            : <></>}
        </>
      }
    </>
  );

};

export default SwipingComparisonApp;
