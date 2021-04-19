/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useState } from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { Range3d } from "@bentley/geometry-core";
import { BlankConnectionProps } from "@bentley/imodeljs-frontend";
import { BlankConnectionViewState, BlankViewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi } from "@itwinjs-sandbox";
import { SimpleLineWidgetProvider } from "./SimpleLineWidget";

const uiProviders = [new SimpleLineWidgetProvider()];

const SimpleLineApp: FunctionComponent = () => {
  const [connection] = useState<BlankConnectionProps>(BlankViewport.getBlankConnection(new Range3d(-35, -35, -35, 35, 35, 35)));
  const [viewState] = useState<BlankConnectionViewState>(BlankViewport.getViewState(true, true));

  /** The sample's render method */
  return (
    <>
      { /** Viewport to display the iModel */}
      <BlankViewer
        authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
        theme={"dark"}
        defaultUiConfig={default3DSandboxUi}
        viewStateOptions={viewState}
        blankConnection={connection}
        uiProviders={uiProviders}
      />
    </>
  );
};

export default SimpleLineApp;

