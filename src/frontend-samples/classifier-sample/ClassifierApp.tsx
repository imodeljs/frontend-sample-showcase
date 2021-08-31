/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizationClient, default3DSandboxUi, SampleIModels, useSampleWidget, ViewSetup } from "@itwinjs-sandbox";
import React, { FunctionComponent, useState } from "react";
import { Viewer } from "@itwin/web-viewer-react";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { IModelViewportControlOptions } from "@bentley/ui-framework";
import { ClassifierWidgetProvider } from "./ClassifierWidget";
import { Angle, Point3d, Vector3d, YawPitchRollAngles } from "@bentley/geometry-core";

const uiProviders = [new ClassifierWidgetProvider()];

const ClassifierApp: FunctionComponent = () => {
  const sampleIModelInfo = useSampleWidget("Use controls below to create a classifier.", [{ context: SampleIModels.MetroStation, imodel: "Philadelphia" }]);
  const [viewportOptions, setViewportOptions] = useState<IModelViewportControlOptions>();

  /** Initializes viewport to set up camera looking at Rittenhouse Square. */
  const getClassifierView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);

    if (viewState.is3d()) {
      viewState.setFocusDistance(375);
      viewState.setRotation(YawPitchRollAngles.createDegrees(30, -35.2, -44).toMatrix3d());
      viewState.setEyePoint(Point3d.create(-1141.7, -1048.9, 338.3));
      viewState.setLensAngle(Angle.createRadians(58.5));
    }

    viewState.setOrigin(Point3d.create(-1270.3, -647.2, -38.9));
    viewState.setExtents(new Vector3d(750, 393, 375));

    return viewState;
  };

  const _oniModelReady = async (iModelConnection: IModelConnection) => {
    const viewState = await getClassifierView(iModelConnection);
    setViewportOptions({ viewState });
  };

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      {sampleIModelInfo?.iModelName && sampleIModelInfo?.contextId && sampleIModelInfo?.iModelId &&
        <Viewer
          contextId={sampleIModelInfo.contextId}
          iModelId={sampleIModelInfo.iModelId}
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          viewportOptions={viewportOptions}
          onIModelConnected={_oniModelReady}
          defaultUiConfig={default3DSandboxUi}
          theme="dark"
          uiProviders={uiProviders}
        />
      }
    </>
  );

};

export default ClassifierApp;
