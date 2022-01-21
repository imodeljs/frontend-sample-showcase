/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { ContextRealityModelProps, FeatureAppearance, OrbitGtBlobProps, RealityDataFormat, RealityDataProvider } from "@itwin/core-common";
import { IModelApp, IModelConnection, ScreenViewport } from "@itwin/core-frontend";
import { RealityDataAccessClient, RealityDataResponse } from "@itwin/reality-data-client";

export default class RealityDataApi {
  public static async getRealityModels(imodel: IModelConnection): Promise<ContextRealityModelProps[]> {
    const RealityDataClient = new RealityDataAccessClient();
    const available: RealityDataResponse = await RealityDataClient.getRealityDatas(await IModelApp.authorizationClient!.getAccessToken(), imodel.iTwinId, undefined);
    const availableModels: ContextRealityModelProps[] = [];

    for (const rdEntry of available.realityDatas) {
      const name = undefined !== rdEntry.displayName ? rdEntry.displayName : rdEntry.id;
      const rdSourceKey = {
        provider: RealityDataProvider.ContextShare,
        format: rdEntry.type === "OPC" ? RealityDataFormat.OPC : RealityDataFormat.ThreeDTile,
        id: rdEntry.id,
      };
      const tilesetUrl = await IModelApp.realityDataAccess?.getRealityDataUrl(imodel.iTwinId, rdSourceKey.id);
      if (tilesetUrl) {
        const entry: ContextRealityModelProps = {
          rdSourceKey,
          tilesetUrl,
          name,
          description: rdEntry?.description,
          realityDataId: rdSourceKey.id,
        };

        availableModels.push(entry);
      }
    }

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
