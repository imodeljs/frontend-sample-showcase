/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizedClientRequestContext, IncludePrefix, request, Response } from "@bentley/itwin-client";
import { AuthorizedFrontendRequestContext, EmphasizeElements, FeatureOverrideType, IModelApp, MarginPercent, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";
import { ColorDef } from "@bentley/imodeljs-common";

export default class MisclassificationApi {
  private static _requestContext: AuthorizedClientRequestContext;


  public static async getTestResults(projectId: string, iModelId: string, resultId: string): Promise<any | undefined> {
    const url = `https://connect-resultsanalysisservice.bentley.com/results/${resultId}`;
    const options = {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Authorization: (await MisclassificationApi.getAccessToken())?.toTokenString(IncludePrefix.Yes),
        context: projectId,
        imodelid: iModelId
      },
    };
    return request(await MisclassificationApi.getRequestContext(), url, options)
      .then((resp: Response): string | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  public static async createClassificationTest(projectId: string, testBody: any): Promise<any | undefined> {
    const url = `https://connect-designvalidationrulemanagement.bentley.com/contexts/${projectId}/tests`;
    const options = {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Authorization: (await MisclassificationApi.getAccessToken())?.toTokenString(IncludePrefix.Yes),
        context: projectId,
      },
      body: testBody
    };
    return request(await MisclassificationApi.getRequestContext(), url, options)
      .then((resp: Response): string | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  public static async runClassificationJob(projectId: string, testBody: any): Promise<any | undefined> {
    const url = `https://connect-designvalidationrulemanagement.bentley.com/contexts/${projectId}/tests/run`;
    const options = {
      method: "GET",
      headers: {
        Prefer: "return=representation",
        Authorization: (await MisclassificationApi.getAccessToken())?.toTokenString(IncludePrefix.Yes),
        context: projectId,
      },
      body: testBody
    };
    return request(await MisclassificationApi.getRequestContext(), url, options)
      .then((resp: Response): string | undefined => {
        if (resp.body === undefined) return undefined;
        return resp.body;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  public static async getTestResultsData(sasURI: string): Promise<any | undefined> {
    const options = {
      method: "GET"
    };
    return request(await MisclassificationApi.getRequestContext(), sasURI, options)
      .then((resp: Response): string | undefined => {
        console.log(resp);
        if (resp.text === undefined) return undefined;
        return resp.text;
      }).catch((_reason: any) => {
        return undefined;
      });
  }

  private static async getAccessToken() {
    try {
      return (IModelApp.authorizationClient as AuthorizationClient).getAccessToken();
    } catch (e) {
      return undefined;
    }
  }

  private static async getRequestContext() {
    if (!MisclassificationApi._requestContext) {
      MisclassificationApi._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return MisclassificationApi._requestContext;
  }

  public static visualize(elementAId: string) {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
    emph.overrideElements(elementAId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
    emph.wantEmphasis = true;
    emph.emphasizeElements([elementAId], vp, undefined, false);

    const viewChangeOpts: ViewChangeOptions = {};
    viewChangeOpts.animateFrustumChange = true;
    viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
    vp.zoomToElements([elementAId], { ...viewChangeOpts });
  }

  /**
   * Sample function for how to create and execute a classification test
   */
  private static async runClassificationTest(projectId: string, iModelId: string, iModelName: string, changesetId: string, changesetName: string) {

    //Create a new classification test. 
    const sampleTest = [{
      "name": "ml_classification",
      "description": "ML classification test",
      "configType": 5,
    }]
    const testResponse = await MisclassificationApi.createClassificationTest(projectId, sampleTest);
    if (testResponse == undefined) return;

    //Trigger a new run classification test run.
    const sampleTestRun = [{
      "iModelId": iModelId,
      "changesetId": changesetId,
      "iModelName": iModelName,
      "changesetName": changesetName,
      "configurationId": testResponse.status[0].id,
      "configurationName": "ml_classification",
      "configurationType": 5
    }]

    const jobResponse = await MisclassificationApi.runClassificationJob(projectId, sampleTestRun);
    if (jobResponse == undefined) return;

    if (jobResponse.status[0].message == 'Success')
      console.log("Successfully created new test run");
  }
}
