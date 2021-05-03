/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { useCallback, useEffect, useState } from "react";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelHubClient, IModelQuery } from "@bentley/imodelhub-client";
import { AuthorizedFrontendRequestContext } from "@bentley/imodeljs-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox/authentication/AuthorizationClient";
import { defaultIModel, defaultIModelList } from "@itwinjs-sandbox/constants";
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { useSampleIModelParameter } from "./useSampleIModelParameter";

const getIModelInfo = async (iModelName: SampleIModels) => {
  const requestContext: AuthorizedFrontendRequestContext = new AuthorizedFrontendRequestContext(await AuthorizationClient.oidcClient.getAccessToken());

  const projectName = iModelName;
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

  const result = { iModelName: projectName, contextId: project.wsgId, iModelId: imodels[0].wsgId };
  return result;
};

export interface SampleIModelInfo {
  iModelName: SampleIModels;
  contextId: string;
  iModelId: string;
}

export type SetCurrentSampleIModel = (iModel: SampleIModels) => void;

/** In place of providing your own iModel, the showcase offers a method of obtaining a **context ID** and **iModel ID** without signing in or creating your own iModels
 *
 * **SANDBOX USE ONLY!** */
export const useSampleIModelConnection = (iModelList?: SampleIModels[]): [SampleIModelInfo | undefined, SetCurrentSampleIModel] => {
  const [iModelParam, setiModelParam] = useSampleIModelParameter();
  const [sampleIModels, setSampleIModels] = useState<SampleIModels[]>(iModelList || defaultIModelList);
  const [iModel, setiModel] = useState<SampleIModels>(iModelParam || sampleIModels[0] || defaultIModel);
  const [iModelInfo, setiModelInfo] = useState<SampleIModelInfo>();

  useEffect(() => {
    if (iModelList && sampleIModels !== iModelList) {
      setSampleIModels(iModelList);
    }
  }, [iModelList, sampleIModels]);

  useEffect(() => {
    if (sampleIModels.length > 0) {
      if (!sampleIModels.includes(iModel)) {
        setiModel(sampleIModels[0]);
      } else if (!iModelInfo || iModelInfo.iModelName !== iModel) {
        getIModelInfo(iModel)
          .then((info) => {
            setiModelInfo(info);
          });
      }
    }
  }, [iModel, sampleIModels, iModelInfo]);

  useEffect(() => {
    if (iModelInfo && iModelInfo.iModelName !== iModelParam) {
      setiModelParam(iModelInfo.iModelName);
    } else if (!iModelInfo && iModelParam && sampleIModels.length <= 0) {
      setiModelParam(undefined);
    }
  }, [iModelInfo, iModelParam, sampleIModels.length, setiModelParam]);

  const setCurrentSampleIModel = useCallback((imodel: SampleIModels) => setiModel(imodel), []);

  return [iModelInfo, setCurrentSampleIModel];

};
