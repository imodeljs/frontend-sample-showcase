/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useState } from "react";
import { AuthorizationClient, default2DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import { Viewer } from "@bentley/itwin-viewer-react";
import { IModelConnection, StandardViewId } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { ClashReviewWidgetProvider } from "./ClashReviewWidget";
import { Spinner, SpinnerSize } from "@bentley/ui-core";
import { ClashReviewTable } from "./ClashReviewTableWidget";

const uiProviders = [new ClashReviewWidgetProvider()];

const ClashReviewApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use the toggles below to show clash marker pins or zoom to a clash.  Click a marker or table entry to review clashes.", [SampleIModels.BayTown]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();
  const [clashData, setClashData] = React.useState<any>();

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await ViewSetup.getDefaultView(iModelConnection);
    viewState.setStandardRotation(StandardViewId.Iso);

    const range = viewState.computeFitRange();
    const aspect = viewState.getAspectRatio();

    viewState.lookAtVolume(range, aspect);
    setViewportOptions({ viewState });
  };

  return (
    <>
      <div className="app-content">
        <div className="top">
          {sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
            <Viewer
              productId="2686"
              contextId={sampleIModelInfo.contextId}
              iModelId={sampleIModelInfo.iModelId}
              authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
              viewportOptions={viewportOptions}
              defaultUiConfig={default2DSandboxUi}
              onIModelConnected={_oniModelReady}
              uiProviders={uiProviders}
              theme="dark"
            />
          }
        </div>
        <div className="bottom">
          {clashData === undefined ?
            (<div ><Spinner size={SpinnerSize.Small} /> Calling API...</div>) :
            (<ClashReviewTable clashData={clashData} />)}
        </div>
      </div>
      { /* Viewport to display the iModel */}
    </>
  );
};

export default ClashReviewApp;
