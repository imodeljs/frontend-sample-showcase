/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, BlankFrontstage, default3DSandboxUi, useSampleWidget } from "@itwinjs-sandbox";
import { Range3d } from "@bentley/geometry-core";
import { Cartographic } from "@bentley/imodeljs-common";
import { BlankConnectionProps } from "@bentley/imodeljs-frontend";
import { DragAndDropTreeProvider } from "./DragAndDropTreeProvider";
import { DragAndDropTreeWidgetProvider } from "./DragAndDropTreeWidget";

const frontstages = [{ provider: new BlankFrontstage(DragAndDropTreeProvider), default: true, requiresIModelConnection: true }];

const connection: BlankConnectionProps = {
  name: "BlankConnection",
  location: Cartographic.fromDegrees(0, 0, 0),
  extents: new Range3d(),
};

const uiProviders = [new DragAndDropTreeWidgetProvider()];

const App: React.FC = () => {
  useSampleWidget("Rearrange tree structure by drag and dropping nodes.", []);

  return (
    <>
      <BlankViewer
        authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
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
