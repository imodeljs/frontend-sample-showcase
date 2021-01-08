/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { ViewportComponent } from "@bentley/ui-components";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ViewSetup } from "api/viewSetup";

export async function ViewportOnlyUI(iModelConnection: IModelConnection, iModelSelector: React.ReactNode) {
  return (
    <>
      { /* Display the instructions and iModelSelector for the sample on a control pane */}
      <ControlPane instructions="Use the toolbar at the top-right to navigate the model." iModelSelector={iModelSelector}></ControlPane>
      { /* Viewport to display the iModel */}
      <ViewportComponent imodel={iModelConnection} viewState={await ViewSetup.getDefaultView(iModelConnection)}></ViewportComponent>
    </>
  );
}

