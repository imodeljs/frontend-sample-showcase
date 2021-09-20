/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { ContextRealityModelProps, FeatureAppearance, OrbitGtBlobProps } from "@bentley/imodeljs-common";
import { IModelConnection, queryRealityData, ScreenViewport } from "@bentley/imodeljs-frontend";

export default class RealityDataApi {

  public static async getRealityModels(imodel: IModelConnection): Promise<ContextRealityModelProps[]> {
    const availableModels: ContextRealityModelProps[] = await queryRealityData({ contextId: imodel.contextId!, filterIModel: imodel });
    return availableModels;
  }

  public static toggleRealityModel(crmProp: ContextRealityModelProps, viewPort: ScreenViewport, show?: boolean) {
    const style = viewPort.displayStyle.clone();

    style.viewFlags.backgroundMap = false;
    const crmName = crmProp.name ? crmProp.name : "";

    if (show && !style.hasAttachedRealityModel(crmName, crmProp.tilesetUrl)) {
      // Form orbitGtBlob if realityDataType is OPC
      let orbitGtBlob: OrbitGtBlobProps | undefined;
      if (crmProp.orbitGtBlob) {
        orbitGtBlob = {
          rdsUrl: crmProp.tilesetUrl,
          containerName: "",
          blobFileName: crmProp.orbitGtBlob.blobFileName,
          sasToken: "",
          accountName: crmProp.realityDataId ? crmProp.realityDataId : "",
        };
      }
      const unattached: ContextRealityModelProps = {
        tilesetUrl: crmProp.tilesetUrl,
        name: crmProp.name ? crmProp.name : "Unnamed",
        description: crmProp.description,
        realityDataId: crmProp.realityDataId,
        orbitGtBlob,
        classifiers: [],
      };
      viewPort.displayStyle.attachRealityModel(unattached);
    } else if (!show) {
      viewPort.displayStyle.detachRealityModelByNameAndUrl(crmName, crmProp.tilesetUrl);
    }
    viewPort.invalidateScene();
  }

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
