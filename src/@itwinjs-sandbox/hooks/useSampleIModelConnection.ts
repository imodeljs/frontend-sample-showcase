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
import { isSampleIModelWithAlternativeName, isSampleIModelWithAlternativeNameArray, SampleIModels, SampleIModelWithAlternativeName } from "@itwinjs-sandbox/SampleIModels";
import { useSampleIModelParameter } from "./useSampleIModelParameter";

const getIModelInfo = async (iModelName: SampleIModels | SampleIModelWithAlternativeName) => {
  const requestContext: AuthorizedFrontendRequestContext = new AuthorizedFrontendRequestContext(await AuthorizationClient.oidcClient.getAccessToken());

  let name: string;
  let context: SampleIModels;

  if (isSampleIModelWithAlternativeName(iModelName)) {
    name = iModelName.imodel;
    context = iModelName.context;
  } else {
    name = iModelName;
    context = iModelName;
  }

  const connectClient = new ContextRegistryClient();
  let project: Project;
  try {
    project = await connectClient.getProject(requestContext as any, { $filter: `Name+eq+'${context}'` });
  } catch (e) {
    throw new Error(`Project with name "${context}" does not exist`);
  }

  const imodelQuery = new IModelQuery();
  imodelQuery.byName(name);

  const hubClient = new IModelHubClient();
  const imodels = await hubClient.iModels.get(requestContext as any, project.wsgId, imodelQuery);

  if (imodels.length === 0)
    throw new Error(`iModel with name "${iModelName}" does not exist in project "${name}"`);

  const result = { contextName: context, iModelName: name, contextId: project.wsgId, iModelId: imodels[0].wsgId };
  return result;
};

export interface SampleIModelInfo {
  contextName: SampleIModels;
  iModelName: string;
  contextId: string;
  iModelId: string;
}

export type SetCurrentSampleIModel = (iModel: SampleIModels) => void;

/** In place of providing your own iModel, the showcase offers a method of obtaining a **context ID** and **iModel ID** without signing in or creating your own iModels
 *
 * **SANDBOX USE ONLY!** */
export const useSampleIModelConnection = (iModelList: (SampleIModels | SampleIModelWithAlternativeName)[] = defaultIModelList): [SampleIModelInfo | undefined, SetCurrentSampleIModel] => {
  const [iModelParam, setiModelParam] = useSampleIModelParameter();
  const [iModel, setiModel] = useState<SampleIModels | SampleIModelWithAlternativeName>(iModelParam || iModelList[0] || defaultIModel);
  const [iModelInfo, setiModelInfo] = useState<SampleIModelInfo>();

  useEffect(() => {
    if (iModelList.length > 0) {
      let found: boolean = false;
      if ((isSampleIModelWithAlternativeNameArray(iModelList) && isSampleIModelWithAlternativeName(iModel))) {
        found = iModelList.some((imodel) => imodel.context === iModel.context && imodel.imodel === iModel.imodel);
      } else {
        found = iModelList.includes(iModel);
      }

      if (!found) {
        setiModel(iModelList[0]);
      } else if (!iModelInfo || (isSampleIModelWithAlternativeName(iModel) ? iModelInfo.iModelName !== iModel.imodel || iModelInfo.contextName !== iModel.context : iModelInfo.iModelName !== iModel)) {
        getIModelInfo(iModel)
          .then((info) => {
            setiModelInfo(info);
          });
      }
    }
  }, [iModel, iModelList, iModelInfo]);

  useEffect(() => {
    if (iModelInfo) {
      if (isSampleIModelWithAlternativeName(iModelParam)) {
        if ((iModelInfo.iModelName !== iModelParam.imodel || iModelInfo.contextName !== iModelParam.context)) {
          if ((iModelInfo.contextName !== iModelInfo.iModelName)) {
            setiModelParam({ context: iModelInfo.contextName, imodel: iModelInfo.iModelName });
          } else {
            setiModelParam(iModelInfo.iModelName);
          }
        }
      } else {
        if (iModelInfo.iModelName !== iModelParam || iModelInfo.contextName !== iModelInfo.iModelName) {
          setiModelParam({ context: iModelInfo.contextName, imodel: iModelInfo.iModelName });
        } else {
          setiModelParam(iModelInfo.iModelName);
        }
      }
    } else if (!iModelInfo && iModelParam && iModelList.length <= 0) {
      setiModelParam(undefined);
    }
  }, [iModelInfo, iModelParam, iModelList.length, setiModelParam]);

  const setCurrentSampleIModel = useCallback((imodel: SampleIModels | SampleIModelWithAlternativeName) => setiModel(imodel), []);

  return [iModelInfo, setCurrentSampleIModel];

};
