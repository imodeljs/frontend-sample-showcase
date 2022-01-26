/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewer } from "@itwin/web-viewer-react";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwin/sandbox";
import { Range3d } from "@itwin/core-geometry";
import { Cartographic } from "@itwin/core-common";
import { BlankConnectionProps } from "@itwin/core-frontend";
import { DragAndDropTreeProvider } from "./DragAndDropTreeProvider";
import { DragAndDropTreeWidgetProvider } from "./DragAndDropTreeWidget";

const frontstages = [{ provider: new BlankFrontstage(DragAndDropTreeProvider), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees({ longitude: 0, latitude: 0, height: 0 }),
  extents: new Range3d(),
};

const uiProviders = [new DragAndDropTreeWidgetProvider()];

const App: React.FC = () => {
  useSampleWidget("Rearrange tree structure by drag and dropping nodes.", []);

  return (
    <>
      <BlankViewer
        authClient={AuthorizationClient.oidcClient}
        enablePerformanceMonitors={true}
        defaultUiConfig={default3DSandboxUi}
        blankConnection={connection}
        frontstages={frontstages}
        uiProviders={uiProviders}
        theme={"dark"}
      />
    </>
  );
};

export default App;
