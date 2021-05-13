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
import { SampleIModels, SampleIModelWithAlternativeName } from "@itwinjs-sandbox/SampleIModels";
import { useSampleIModelParameter } from "./useSampleIModelParameter";

// iModelList?: SampleIModels[] | {context: SampleIModels, imodel: string}[]
const getIModelInfo = async (iModelName: SampleIModels | SampleIModelWithAlternativeName) => {
  const requestContext: AuthorizedFrontendRequestContext = new AuthorizedFrontendRequestContext(await AuthorizationClient.oidcClient.getAccessToken());

  let name: string;
  let context: SampleIModels;

  if(instanceOfSampleIModelWithAlternativeName(iModelName)){
    name = iModelName.imodel;
    context = iModelName.context;
  }else {
    name = iModelName.toString();
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

  const result = { iModelName: name as SampleIModels, contextId: project.wsgId, iModelId: imodels[0].wsgId };
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
export const useSampleIModelConnection = (iModelList: (SampleIModels | SampleIModelWithAlternativeName)[] = defaultIModelList): [SampleIModelInfo | undefined, SetCurrentSampleIModel] => {
  const [iModelParam, setiModelParam] = useSampleIModelParameter();
  const [iModel, setiModel] = useState<SampleIModels | SampleIModelWithAlternativeName>(iModelParam || iModelList[0] || defaultIModel);
  const [iModelInfo, setiModelInfo] = useState<SampleIModelInfo>();

  useEffect(() => {
    if (iModelList.length > 0) {
      let found: boolean = false;
      iModelList.forEach((element: SampleIModels | SampleIModelWithAlternativeName) => {
        // If they are both of type SampleIModelWithAlternativeName, with matching values, no need to setIModel
        if((element as SampleIModelWithAlternativeName).context
          && (element as SampleIModelWithAlternativeName).context === (iModel as SampleIModelWithAlternativeName).context
          && (element as SampleIModelWithAlternativeName).imodel === (iModel as SampleIModelWithAlternativeName).imodel) {
          found = true;
        // If they are both of type SampleIModels, with matching values, no need to setIModel
        } else if((element as SampleIModels) && (element as SampleIModels) === (iModel as SampleIModels)){
          found = true;
        }
      });

      if (!found) {
        setiModel(iModelList[0]);
      } else if (!iModelInfo
        || ((iModel as SampleIModelWithAlternativeName).imodel && iModelInfo.iModelName !== (iModel as SampleIModelWithAlternativeName).imodel)
        || ((iModel as SampleIModelWithAlternativeName).context === undefined && iModelInfo?.iModelName !== (iModel as SampleIModels))) {
        getIModelInfo(iModel)
          .then((info) => {
            setiModelInfo(info);
          });
      }
    }
  }, [iModel, iModelList, iModelInfo]);

  useEffect(() => {
    if (iModelInfo && iModelInfo.iModelName !== iModelParam) {
      setiModelParam(iModelInfo.iModelName);
    } else if (!iModelInfo && iModelParam && iModelList.length <= 0) {
      setiModelParam(undefined);
    }
  }, [iModelInfo, iModelParam, iModelList.length, setiModelParam]);

  const setCurrentSampleIModel = useCallback((imodel: SampleIModels) => setiModel(imodel), []);

  return [iModelInfo, setCurrentSampleIModel];

};

export const instanceOfSampleIModelWithAlternativeName = (object: SampleIModels | SampleIModelWithAlternativeName): object is SampleIModelWithAlternativeName => {
  if((object as SampleIModelWithAlternativeName).context)
    return true;
  return false;
};
