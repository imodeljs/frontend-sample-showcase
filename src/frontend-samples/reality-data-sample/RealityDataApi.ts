/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { ContextRealityModelProps, FeatureAppearance } from "@bentley/imodeljs-common";
import {
  ContextRealityModelState, IModelConnection, queryRealityData, ScreenViewport,
} from "@bentley/imodeljs-frontend";

export default class RealityDataApi {

  // START ANNOTATION 8
  public static async toggleRealityModel(showReality: boolean, viewPort: ScreenViewport, imodel: IModelConnection) {
    // START ANNOTATION 9
    const style = viewPort.displayStyle.clone();

    // Turn off the background
    style.viewFlags.backgroundMap = false;
    // END ANNOTATION 9

    // START ANNOTATION 10
    if (showReality) {
      // Get first available reality model and attach it to displayStyle
      const availableModels: ContextRealityModelProps[] = await queryRealityData({ contextId: imodel.contextId!, filterIModel: imodel });
      for (const crmProp of availableModels) {
        style.attachRealityModel(crmProp);
        viewPort.displayStyle = style;
        return;
      }
      // END ANNOTATION 10
      // START ANNOTATION 11
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
    // END ANNOTATION 11
  }
  // END ANNOTATION 8

  // START ANNOTATION 5
  // Modify reality data background transparency using the Viewport API
  public static async setRealityDataTransparency(vp: ScreenViewport, transparency: number) {
    // For this example we want to affect the appearance of *all* reality models. Therefore, we use -1 as the index.
    // START ANNOTATION 6
    const existingOverrides = vp.getRealityModelAppearanceOverride(-1);
    // END ANNOTATION 6
    // START ANNOTATION 7
    return vp.overrideRealityModelAppearance(-1, existingOverrides ? existingOverrides.clone({ transparency }) : FeatureAppearance.fromJSON({ transparency }));
    // END ANNOTATION 7
  }
  // END ANNOTATION 5
}
