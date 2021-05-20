/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ContextRealityModelProps, ModelProps, ModelQueryParams, SpatialClassificationProps } from "@bentley/imodeljs-common";
import { ContextRealityModelState, IModelConnection, queryRealityData, ScreenViewport, SpatialModelState, SpatialViewState, Viewport } from "@bentley/imodeljs-frontend";
import { Presentation, SelectionChangesListener } from "@bentley/presentation-frontend";

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
    const availableModels: ContextRealityModelProps[] = await queryRealityData({ contextId: imodel.contextId!, filterIModel: imodel });
    for (const crmProp of availableModels) {
      style.attachRealityModel(crmProp);
      viewPort.displayStyle = style;
      break;
    }
  }

  /**
   * Query the iModel to get available spatial classifiers.
   * Also do a custom sort and filtering for the purposes of this sample.
   */
  public static async getAvailableClassifierListForViewport(vp?: Viewport): Promise<{ [key: string]: string }> {
    const models: { [key: string]: string } = {};
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
        models[modelId] = name.substring(0, name.indexOf(","));
      }
    }

    return Promise.resolve(models);
  }

  // Update the classifier in the ViewPort
  public static updateRealityDataClassifiers(vp: ScreenViewport, classifier: SpatialClassificationProps.Classifier) {
    // Get the first reality model in the view
    const existingRealityModels: ContextRealityModelState[] = [];
    vp.displayStyle.forEachRealityModel(
      (modelState: ContextRealityModelState) =>
        existingRealityModels.push(modelState),
    );
    const realityModel = existingRealityModels[0];

    // Loop through all classifiers in the reality model.
    // If the classifier exists, update it with classifier properties
    // If the classifier is not found, add it to realityModel.classifiers
    let existingClassifier: boolean = false;
    if (realityModel && realityModel.classifiers) {
      Array.from(realityModel.classifiers).forEach((storedClassifier) => {
        if (classifier.name === storedClassifier.name) {
          existingClassifier = true;
          storedClassifier.name = classifier.name;
          storedClassifier.expand = classifier.expand;
          storedClassifier.flags = classifier.flags;
          storedClassifier.modelId = classifier.modelId;
        }
      });

      if (!existingClassifier)
        realityModel.classifiers.push(classifier);

      realityModel.classifiers.active = classifier;
      vp.invalidateScene();

      return;
    }
  }
}
