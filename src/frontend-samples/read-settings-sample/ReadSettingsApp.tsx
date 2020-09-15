/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import ReadSettingsUI from "./ReadSettingsUI";
import SampleApp from "common/SampleApp";
import { AuthorizedFrontendRequestContext, IModelApp } from "@bentley/imodeljs-frontend";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelQuery } from "@bentley/imodelhub-client";

interface ProjectContext {
  projectId: string;
  imodelId: string;
  requestContext: AuthorizedFrontendRequestContext;
}

const namespace = "showcase";

export default class ReadSettingsApp implements SampleApp {

  public static projectContext: ProjectContext;

  // This method serves to query projectId of project where iModel is stored in this example,
  // however in real application you might have it upfront already
  public static async getIModelInfo(iModelName: string): Promise<ProjectContext> {
    // In testdrive the projectName matches iModelName.  That's not true in general.
    const projectName = iModelName;
    const connectClient = new ContextRegistryClient();
    let project: Project;

    const context = await AuthorizedFrontendRequestContext.create();

    try {
      project = await connectClient.getProject(context, { $filter: `Name+eq+'${iModelName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(iModelName);
    const imodels = await IModelApp.iModelClient.iModels.get(context, project.wsgId, imodelQuery);
    if (imodels.length === 0)
      throw new Error(`iModel with name "${iModelName}" does not exist in project "${projectName}"`);

    return { projectId: project.wsgId, imodelId: imodels[0].wsgId, requestContext: context };
  }

  // Read settings from ProductSettingsService
  public static async readSettings(settingName: string) {
    const { projectId, imodelId, requestContext } = ReadSettingsApp.projectContext;
    return IModelApp.settings.getSetting(requestContext, namespace, settingName, true, projectId, imodelId);
  }

  // The showcase does not have permission to write data, it is expected to fail with 403 Forbidden.
  // However saveSetting method will work in your project with signed-in user, who has required permissions in the project.
  public static async saveSettings(settingName: string, settingValue: string) {
    const { projectId, imodelId, requestContext } = ReadSettingsApp.projectContext;
    return IModelApp.settings.saveSetting(requestContext, settingValue, namespace, settingName, true, projectId, imodelId);
  }

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    ReadSettingsApp.projectContext = await ReadSettingsApp.getIModelInfo(iModelName);
    return <ReadSettingsUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }
}
