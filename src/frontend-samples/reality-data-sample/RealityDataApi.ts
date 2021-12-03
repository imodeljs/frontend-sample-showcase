/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { ContextRealityModelProps, FeatureAppearance, OrbitGtBlobProps } from "@itwin/core-common";
import { IModelConnection, queryRealityData, ScreenViewport } from "@itwin/core-frontend";

export default class RealityDataApi {
  public static async getRealityModels(imodel: IModelConnection): Promise<ContextRealityModelProps[]> {
    const availableModels: ContextRealityModelProps[] = await queryRealityData({ contextId: imodel.contextId!, filterIModel: imodel });
    return availableModels;
  }

  // START REALITY_TOGGLE_CALLBACK
  public static toggleRealityModel(crmProp: ContextRealityModelProps, viewPort: ScreenViewport, show?: boolean) {
    const crmName = crmProp.name ? crmProp.name : "";

    // START REALITY_MODEL_ON
    if (show && !viewPort.displayStyle.hasAttachedRealityModel(crmName, crmProp.tilesetUrl)) {
      // Form orbitGtBlob object if reality data type is Point Cloud (orbitGTBlob is defined)
      let orbitGtBlob: OrbitGtBlobProps | undefined;
      if (crmProp.orbitGtBlob) {
        orbitGtBlob = {
          rdsUrl: crmProp.tilesetUrl,
          containerName: "",
          blobFileName: crmProp.orbitGtBlob.blobFileName,
          sasToken: "",
          accountName: crmProp.realityDataId ? crmProp.realityDataId : "",
        };
        crmProp.orbitGtBlob = orbitGtBlob;
      }
      viewPort.displayStyle.attachRealityModel(crmProp);
    // END REALITY_MODEL_ON
    } else if (!show) {
      viewPort.displayStyle.detachRealityModelByNameAndUrl(crmName, crmProp.tilesetUrl);
    }
    viewPort.invalidateScene();
  }
  // END REALITY_TOGGLE_CALLBACK

  // START TRANSPARENCY
  // Modify reality data background transparency using the Viewport API
  public static setRealityDataTransparency(crmProp: ContextRealityModelProps, vp: ScreenViewport, transparency?: number) {
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
