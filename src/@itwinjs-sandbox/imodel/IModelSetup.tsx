/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizedFrontendRequestContext } from "@bentley/imodeljs-frontend";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelHubClient, IModelQuery } from "@bentley/imodelhub-client";
import { AuthorizationClient } from "../authentication/AuthorizationClient";
import { defaultIModel, SampleIModels } from "@itwinjs-sandbox";
import { defaultIModelList } from "@itwinjs-sandbox/constants";
import { BeEvent } from "@bentley/bentleyjs-core";

export interface IModelResult {
  iModelName: SampleIModels;
  contextId: string;
  iModelId: string;
}

export type onIModelResultEvent = (result: IModelResult) => void;

export class IModelSetup {

  private static _sampleIModels: SampleIModels[] = defaultIModelList;
  public static onIModelChanged: BeEvent<onIModelResultEvent> = new BeEvent<onIModelResultEvent>();
  public static currentIModel?: IModelResult;

  public static getIModelList() {
    return IModelSetup._sampleIModels;
  }

  public static setIModelList(value: SampleIModels[] = defaultIModelList) {
    IModelSetup._sampleIModels = value;
    IModelSetup.changeIModel();
  }

  public static resetIModelList() {
    IModelSetup.currentIModel = undefined;
    IModelSetup._sampleIModels = defaultIModelList;
    IModelSetup.onIModelChanged.clear();
  }

  public static async changeIModel(iModelName?: SampleIModels) {
    const result = await this.getIModelInfo(iModelName);
    IModelSetup.currentIModel = result;
    IModelSetup.onIModelChanged.raiseEvent(result);
  }

  public static async getIModelInfo(iModelName?: SampleIModels) {
    const requestContext: AuthorizedFrontendRequestContext = new AuthorizedFrontendRequestContext(await AuthorizationClient.oidcClient.getAccessToken());

    let projectName = iModelName || this.getiModelParam() || defaultIModel;

    if (IModelSetup._sampleIModels.length && !IModelSetup._sampleIModels.includes(projectName as SampleIModels)) {
      projectName = IModelSetup._sampleIModels[0];
    }

    const connectClient = new ContextRegistryClient();
    let project: Project;
    try {
      project = await connectClient.getProject(requestContext as any, { $filter: `Name+eq+'${projectName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(projectName);

    const hubClient = new IModelHubClient();
    const imodels = await hubClient.iModels.get(requestContext as any, project.wsgId, imodelQuery);

    if (imodels.length === 0)
      throw new Error(`iModel with name "${iModelName}" does not exist in project "${projectName}"`);

    this.updateiModelParam(projectName);
    const result = { iModelName: projectName as SampleIModels, contextId: project.wsgId, iModelId: imodels[0].wsgId };
    return result;
  }

  private static getiModelParam() {
    const params = new URLSearchParams(window.location.search);
    const imodel = params.get("imodel");
    return imodel;
  }

  private static updateiModelParam(imodel: string) {
    const params = new URLSearchParams(window.location.search);

    if (imodel) {
      if (params.has("imodel")) {
        params.set("imodel", imodel);
      } else {
        params.append("imodel", imodel);
      }
    }

    // Detect if editor was enabled in URL params as a semi-backdoor, this
    // bypasses the ld feature flag
    const editorEnabled = new URLSearchParams(window.location.search).get("editor");
    if (editorEnabled) params.append("editor", editorEnabled);

    window.history.pushState(null, "", `?${params.toString()}`);

    // Send to parent if within an iframe.
    if (window.self !== window.top) {
      window.parent.postMessage(`?${params.toString()}`, "*");
    }
  }
}
