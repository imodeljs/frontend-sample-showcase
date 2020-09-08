/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import * as React from "react";
import { ContextRealityModelProps } from "@bentley/imodeljs-common";
import {
  ContextRealityModelState, findAvailableUnattachedRealityModels, IModelConnection, ScreenViewport,
} from "@bentley/imodeljs-frontend";
import RealityDataUI from "./RealityDataUI";

export default class RealityDataApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <RealityDataUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static async toggleRealityModel(showReality: boolean, viewPort: ScreenViewport, imodel: IModelConnection) {
    const style = viewPort.displayStyle.clone();

    if (showReality) {
      // Get all available reality models and attach them to displayStyle
      const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
      for (const crmProp of availableModels) {
        style.attachRealityModel(crmProp);
        viewPort.displayStyle = style;
      }
    } else {
      // Collect reality models on displayStyle and detach
      const models: ContextRealityModelState[] = [];
      style.forEachRealityModel(
        (modelState: ContextRealityModelState) => { models.push(modelState); },
      );
      for (const model of models)
        style.detachRealityModelByNameAndUrl(model.name, model.url);
      viewPort.displayStyle = style;
    }
  }
}
