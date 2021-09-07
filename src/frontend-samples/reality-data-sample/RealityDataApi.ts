/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { ContextRealityModelProps, FeatureAppearance } from "@bentley/imodeljs-common";
import { IModelConnection, queryRealityData, ScreenViewport } from "@bentley/imodeljs-frontend";

export default class RealityDataApi {

  public static async getRealityModels(imodel: IModelConnection): Promise<ContextRealityModelProps[]> {
    const availableModels: ContextRealityModelProps[] = await queryRealityData({ contextId: imodel.contextId!, filterIModel: imodel });
    return availableModels;
  }

  // START REALITY_TOGGLE_CALLBACK
  /*public static async toggleRealityModel(showReality: boolean, viewPort: ScreenViewport, imodel: IModelConnection) {
    // START DISPLAY_STYLE
    const style = viewPort.displayStyle.clone();

    // Turn off the background
    style.viewFlags.backgroundMap = false;
    // END DISPLAY_STYLE

    // START REALITY_MODEL_ON
    if (showReality) {
      // Get first available reality model and attach it to displayStyle
      const availableModels: ContextRealityModelProps[] = await queryRealityData({ contextId: imodel.contextId!, filterIModel: imodel });
      for (const crmProp of availableModels) {
        style.attachRealityModel(crmProp);
        viewPort.displayStyle = style;
        return;
      }
      // END REALITY_MODEL_ON
      // START REALITY_MODEL_OFF
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
    // END REALITY_MODEL_OFF
  }*/
  public static toggleRealityModel(crmProp: ContextRealityModelProps, viewPort: ScreenViewport, show?: boolean) {
    const style = viewPort.displayStyle.clone();

    style.viewFlags.backgroundMap = false;
    const crmName = crmProp.name ? crmProp.name : "";
    if (show && !style.hasAttachedRealityModel(crmName, crmProp.tilesetUrl)) {
      console.log(`turning on ${crmProp.name}`);
      style.attachRealityModel(crmProp);
    } else if (!show) {
      console.log(`turning off ${crmProp.name}`);
      style.detachRealityModelByNameAndUrl(crmName, crmProp.tilesetUrl);
    }

    viewPort.displayStyle = style;
  }
  // END REALITY_TOGGLE_CALLBACK

  // START TRANSPARENCY
  // Modify reality data background transparency using the Viewport API
  public static setRealityDataTransparency(crmProp: ContextRealityModelProps, vp: ScreenViewport, transparency?: number) {
    // For this example we want to affect the appearance of *all* reality models.
    if (transparency === undefined)
      transparency = 0;
    // START APPEARANCE
    vp.displayStyle.settings.contextRealityModels.models.forEach((model) => {
      // START OVERRIDES
      if (model.matchesNameAndUrl(crmProp.name!, crmProp.tilesetUrl))
        model.appearanceOverrides = model.appearanceOverrides ? model.appearanceOverrides.clone({ transparency }) : FeatureAppearance.fromJSON({ transparency });
    });
    // END APPEARANCE
    // END OVERRIDES
    return true;
  }
  // END TRANSPARENCY
}
