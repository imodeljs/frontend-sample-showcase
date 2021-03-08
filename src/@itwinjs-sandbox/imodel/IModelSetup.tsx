/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthorizedFrontendRequestContext } from "@bentley/imodeljs-frontend";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelHubClient, IModelQuery } from "@bentley/imodelhub-client";
import { AuthorizationClient } from "../authentication/AuthorizationClient";
import { defaultIModel } from "@itwinjs-sandbox/components/imodel-selector/IModelSelector";
import { SampleIModels } from "@itwinjs-sandbox";

export class IModelSetup {

  private static _currentIModel: SampleIModels | undefined;

  public static setIModel(currentIModel: SampleIModels) {
    this._currentIModel = currentIModel;
  }

  public static clearIModel() {
    this._currentIModel = undefined;
  }

  public static async getIModelInfo(iModelName?: SampleIModels) {
    const requestContext: AuthorizedFrontendRequestContext = new AuthorizedFrontendRequestContext(await AuthorizationClient.oidcClient.getAccessToken());

    const projectName = iModelName || this._currentIModel || defaultIModel;

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
    return { imodelName: projectName, projectId: project.wsgId, imodelId: imodels[0].wsgId };
  }
}
