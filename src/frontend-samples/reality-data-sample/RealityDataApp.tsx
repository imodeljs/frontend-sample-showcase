/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { ContextRealityModelProps } from "@bentley/imodeljs-common";
import { findAvailableUnattachedRealityModels, IModelConnection, ViewState } from "@bentley/imodeljs-frontend";

import SampleApp from "common/SampleApp";
import RealityDataUI from "./RealityDataUI";

export default class RealityDataApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <RealityDataUI iModelName={iModelName} iModelSelector={iModelSelector} />;

  }

  public static async attachRealityModelToViewState(viewState: ViewState, imodel: IModelConnection) {
    if (viewState.isSpatialView()) {
      const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
      for (const crmProp of availableModels) {
        viewState.displayStyle.attachRealityModel(crmProp);
      }
    }
  }
}
