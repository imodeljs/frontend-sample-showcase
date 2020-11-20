/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import * as React from "react";
import ClassifierUI from "./ClassifierUI";
import { ContextRealityModelProps, ModelProps, ModelQueryParams, SpatialClassificationProps } from "@bentley/imodeljs-common";
import { ContextRealityModelState, findAvailableUnattachedRealityModels, IModelConnection, ScreenViewport, SpatialModelState, SpatialViewState, Viewport } from "@bentley/imodeljs-frontend";

export default class ClassifierApp implements SampleApp {

  public static updateRealityDataClassifiers(view: ScreenViewport, classifier: SpatialClassificationProps.Properties) {
    const existingRealityModels: ContextRealityModelState[] = [];
    view.displayStyle.forEachRealityModel(
      (modelState: ContextRealityModelState) =>
        existingRealityModels.push(modelState),
    );
    const entry: ContextRealityModelState = existingRealityModels[0];

    const props = {
      tilesetUrl: entry.url,
      name: entry.name ? entry.name : classifier.name,
      description: entry.description,
      classifiers: [classifier],
    };

    // For situations where we are removing classifiers just remove and reattach latest set of classifiers.
    view.displayStyle.detachRealityModelByIndex(0);
    view.displayStyle.attachRealityModel(props);
    view.invalidateScene();
  }

  public static async getAvailableModelListForViewport(vp?: Viewport): Promise<{ [key: string]: string }> {
    const models: { [key: string]: string } = {};
    if (!vp || !(vp.view instanceof SpatialViewState))
      return Promise.resolve(models);

    const modelQueryParams: ModelQueryParams = {
      from: SpatialModelState.classFullName,
      wantPrivate: false,
    };

    let curModelProps: ModelProps[] = new Array<ModelProps>();
    curModelProps = await vp.iModel.models.queryProps(modelQueryParams);

    // Custom sort to put 'Buildings' first. It makes the best default example.
    curModelProps = curModelProps.sort((a, b) => {
      if (b.name?.includes("Buildings"))
        return 1;
      if (a.name?.includes("Buildings"))
        return -1;
      return a.name!.localeCompare(b.name!);
    });

    // Filter out models that are not classifiers and form {[key: string]: string } object
    for (const modelProps of curModelProps) {
      if (modelProps.id && modelProps.name !== "PhiladelphiaClassification" && modelProps.name !== "Philadelphia_Pictometry") {
        const modelId = modelProps.id;
        const name = modelProps.name ? modelProps.name : modelId;
        models[modelId] = name;
      }
    }

    return Promise.resolve(models);
  }

  public static async turnOnAvailableRealityModels(viewPort: ScreenViewport, imodel: IModelConnection) {
    const style = viewPort.displayStyle.clone();

    // Get first available reality models and attach them to displayStyle
    const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
    for (const crmProp of availableModels) {
      style.attachRealityModel(crmProp);
      viewPort.displayStyle = style;
      break;
    }
  }

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ClassifierUI iModelName={iModelName} iModelName2={"Philadelphia"} iModelSelector={iModelSelector} />;
  }
}
