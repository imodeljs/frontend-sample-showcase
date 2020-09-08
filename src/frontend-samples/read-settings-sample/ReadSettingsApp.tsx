/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, MarginPercent, ViewChangeOptions, ZoomToOptions, AuthorizedFrontendRequestContext } from "@bentley/imodeljs-frontend";
import ExternalSettingsUI, { ExternalSettingsState } from "./ZoomToElementsUI";
import SampleApp from "common/SampleApp";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelQuery } from "@bentley/imodelhub-client";

export default class ReadSettingsApp implements SampleApp {

  private static async getIModelInfo(iModelName: string): Promise<{ projectId: string, imodelId: string }> {
    const requestContext: AuthorizedFrontendRequestContext = await AuthorizedFrontendRequestContext.create();
    console.log("context", requestContext);

    // In testdrive the projectName matches iModelName.  That's not true in general.
    const projectName = iModelName;

    const connectClient = new ContextRegistryClient();
    let project: Project;
    try {
      project = await connectClient.getProject(requestContext, { $filter: `Name+eq+'${projectName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(iModelName);
    const imodels = await IModelApp.iModelClient.iModels.get(requestContext, project.wsgId, imodelQuery);
    if (imodels.length === 0)
      throw new Error(`iModel with name "${iModelName}" does not exist in project "${projectName}"`);
    console.log('project', project);
    console.log('imodels', imodels);
    return { projectId: project.wsgId, imodelId: imodels[0].wsgId };
  }

  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void) {
    const info = await ReadSettingsApp.getIModelInfo(iModelName);
    console.log(info);
    const requestContext = await AuthorizedFrontendRequestContext.create();

    const settingsResult = await IModelApp.settings.getSharedSetting(requestContext, "showcase", "metadata", false, info.projectId, info.imodelId);
    console.log(settingsResult);
    return <ExternalSettingsUI iModelName={iModelName} setupControlPane={setupControlPane} settings={settingsResult.setting} />;
  }
}
