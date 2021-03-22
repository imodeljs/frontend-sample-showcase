/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { ContextRealityModelProps, FeatureAppearance } from "@bentley/imodeljs-common";
import {
  ContextRealityModelState, findAvailableUnattachedRealityModels, IModelConnection, ScreenViewport, Viewport,
} from "@bentley/imodeljs-frontend";

export default class RealityDataApp {

  public static async toggleRealityModel(showReality: boolean, viewPort: ScreenViewport, imodel: IModelConnection) {
    const style = viewPort.displayStyle.clone();

    // Turn off the background
    style.viewFlags.backgroundMap = false;

    if (showReality) {
      // Get first available reality model and attach it to displayStyle
      const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
      for (const crmProp of availableModels) {
        style.attachRealityModel(crmProp);
        viewPort.displayStyle = style;
        return;
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

  // Modify reality data background transparency using the Viewport API
  public static async setRealityDataTransparency(vp: ScreenViewport, transparency: number) {
    // For this example we want to affect the appearance of *all* reality models. Therefore, we use -1 as the index.
    const existingOverrides = vp.getRealityModelAppearanceOverride(-1);
    return vp.overrideRealityModelAppearance(-1, existingOverrides ? existingOverrides.clone({ transparency }) : FeatureAppearance.fromJSON({ transparency }));
  }
}
