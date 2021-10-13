/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizedFrontendRequestContext, EmphasizeElements, FeatureOverrideType, IModelApp, MarginPercent, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";
import { BeEvent } from "@bentley/bentleyjs-core";
import { ColorDef } from "@bentley/imodeljs-common";
import MisclassificationClient from "./MisclassificationClient";
import { jsonResultData } from "./MisclassificationJson";

export default class MisclassificationApi {

  public static onValidationDataChanged = new BeEvent<any>();

  private static _requestContext: AuthorizedClientRequestContext;
  private static _validationData: { [id: string]: any } = {};

  private static async getRequestContext() {
    if (!MisclassificationApi._requestContext) {
      MisclassificationApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return MisclassificationApi._requestContext;
  }

  public static async setValidationData(projectId: string): Promise<void> {
    const validationData = await MisclassificationApi.getValidationData(projectId);
    MisclassificationApi.onValidationDataChanged.raiseEvent(validationData);
  }

  public static async getValidationData(projectId: string): Promise<any> {
    const context = await MisclassificationApi.getRequestContext();
    if (MisclassificationApi._validationData[projectId] === undefined) {
      const resultResponse = await MisclassificationClient.getTestResults(context, projectId);
      if (resultResponse !== undefined && resultResponse.result !== undefined) {
        MisclassificationApi._validationData[projectId] = resultResponse;
      }
      if (MisclassificationApi._validationData[projectId] === undefined) {
        MisclassificationApi._validationData[projectId] = jsonResultData;
      }
    }

    return { validationData: MisclassificationApi._validationData[projectId] };
  }

  public static visualize(elementId: string) {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
    emph.overrideElements(elementId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
    emph.wantEmphasis = true;
    emph.emphasizeElements([elementId], vp, undefined, false);

    const viewChangeOpts: ViewChangeOptions = {};
    viewChangeOpts.animateFrustumChange = true;
    viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
    void vp.zoomToElements([elementId], { ...viewChangeOpts });
  }
}
