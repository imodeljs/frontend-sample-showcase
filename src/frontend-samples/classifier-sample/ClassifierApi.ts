/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { RealityDataAccessClient, RealityDataResponse } from "@itwin/reality-data-client";
import { Id64String } from "@itwin/core-bentley";
import { ContextRealityModel, ContextRealityModelProps, ModelProps, ModelQueryParams, RealityDataFormat, RealityDataProvider, SpatialClassifier } from "@itwin/core-common";
import { IModelApp, IModelConnection, ScreenViewport, SpatialModelState, SpatialViewState, Viewport } from "@itwin/core-frontend";
import { SelectOption } from "@itwin/itwinui-react";
import { Presentation, SelectionChangesListener } from "@itwin/presentation-frontend";

export default class ClassifierApi {
  private static _selectionListener: SelectionChangesListener;

  public static removeSelectionListener() {
    Presentation.selection.selectionChange.removeListener(this._selectionListener);
  }

  public static addSelectionListener(listener: SelectionChangesListener) {
    this._selectionListener = listener;
    Presentation.selection.selectionChange.addListener(this._selectionListener);
  }

  public static async turnOnAvailableRealityModel(viewPort: ScreenViewport, imodel: IModelConnection) {
    const style = viewPort.displayStyle.clone();

    // Get first available reality models and attach them to displayStyle
    const RealityDataClient = new RealityDataAccessClient();
    const availableModels: RealityDataResponse = await RealityDataClient.getRealityDatas(await IModelApp.authorizationClient!.getAccessToken(), imodel.iTwinId, undefined);

    for (const rdEntry of availableModels.realityDatas) {
      const name = undefined !== rdEntry.displayName ? rdEntry.displayName : rdEntry.id;
      const rdSourceKey = {
        provider: RealityDataProvider.ContextShare,
        format: rdEntry.type === "OPC" ? RealityDataFormat.OPC : RealityDataFormat.ThreeDTile,
        id: rdEntry.id,
      };
      const tilesetUrl = await IModelApp.realityDataAccess?.getRealityDataUrl(imodel.iTwinId, rdSourceKey.id);
      if (tilesetUrl) {
        const entry: ContextRealityModelProps = {
          classifiers: [],
          rdSourceKey,
          tilesetUrl,
          name,
          realityDataId: rdSourceKey.id,
        };
        style.attachRealityModel(entry);
        viewPort.displayStyle = style;
      }
      break;
    }
  }

  /**
   * Query the iModel to get available spatial classifiers.
   * Also do a custom sort and filtering for the purposes of this sample.
   */
  public static async getAvailableClassifierListForViewport(vp?: Viewport): Promise<SelectOption<Id64String>[]> {
    const models: SelectOption<string>[] = [];
    if (!vp || !(vp.view instanceof SpatialViewState))
      return Promise.resolve(models);

    const modelQueryParams: ModelQueryParams = {
      from: SpatialModelState.classFullName,
      wantPrivate: false,
    };

    let curModelProps: ModelProps[] = new Array<ModelProps>();
    curModelProps = await vp.iModel.models.queryProps(modelQueryParams);

    // Custom sort to put 'Commercial' first. It makes the best default example.
    curModelProps = curModelProps.sort((a, b) => {
      if (b.name?.includes("Commercial"))
        return 1;
      if (a.name?.includes("Commercial"))
        return -1;
      return a.name!.localeCompare(b.name!);
    });

    // Filter out models that are not classifiers and form {[key: string]: string } object
    for (const modelProps of curModelProps) {
      if (modelProps.id && modelProps.name !== "PhiladelphiaClassification" && modelProps.name !== "Philadelphia_Pictometry") {
        const modelId = modelProps.id;
        const name = modelProps.name ? modelProps.name : modelId;
        models.push({ value: modelId, label: name.substring(0, name.indexOf(",")) });
      }
    }

    return Promise.resolve(models);
  }

  // Update the classifier in the ViewPort
  public static updateRealityDataClassifiers(vp: ScreenViewport, classifier: SpatialClassifier) {
    // Get the first reality model in the view
    const realityModel: ContextRealityModel = vp.displayStyle.settings.contextRealityModels.models[0];

    // Loop through all classifiers in the reality model.
    // If the classifier exists (check by name), replace it with classifier argument
    // If the classifier is not found, add it to realityModel.classifiers
    if (realityModel && realityModel.classifiers) {
      let existingClassifier: SpatialClassifier | undefined;
      for (const c of realityModel.classifiers) {
        if (c.name === classifier.name) {
          existingClassifier = c;
        }
      }

      if (!existingClassifier)
        realityModel.classifiers.add(classifier);
      else
        realityModel.classifiers.replace(existingClassifier, classifier);

      realityModel.classifiers.setActive(classifier);
      vp.invalidateScene();

      return;
    }
  }
}
