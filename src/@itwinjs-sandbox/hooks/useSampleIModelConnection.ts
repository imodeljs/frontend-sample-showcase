/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { useCallback, useEffect, useState } from "react";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { IModelHubClient, IModelQuery } from "@bentley/imodelhub-client";
import { AuthorizationClient } from "@itwinjs-sandbox";
import { defaultIModel, defaultIModelList } from "@itwinjs-sandbox/constants";
import { isSampleIModelWithAlternativeName, isSampleIModelWithAlternativeNameArray, lookupSampleIModelWithContext, SampleIModels, SampleIModelWithAlternativeName } from "@itwinjs-sandbox/SampleIModels";
import { useSampleIModelParameter } from "./useSampleIModelParameter";

export const getIModelInfo = async (iModelName: SampleIModels | SampleIModelWithAlternativeName) => {
  const accessToken = await AuthorizationClient.oidcClient.getAccessToken()

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
    project = await connectClient.getProject(accessToken as any, { $filter: `Name+eq+'${context}'` });
  } catch (e) {
    throw new Error(`Project with name "${context}" does not exist`);
  }

  const imodelQuery = new IModelQuery();
  imodelQuery.byName(name);

  const hubClient = new IModelHubClient();
  const imodels = await hubClient.iModels.get(accessToken as any, project.wsgId, imodelQuery);

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
  const [iModelInfo, setiModelInfo] = useState<SampleIModelInfo>();

  const setCurrentSampleIModel = useCallback(async (iModel: SampleIModels | SampleIModelWithAlternativeName) => {
    if (iModelList.length > 0) {
      let found: SampleIModelWithAlternativeName | SampleIModels | undefined;
      if ((isSampleIModelWithAlternativeNameArray(iModelList) && isSampleIModelWithAlternativeName(iModel))) {
        found = iModelList.find((imodel) => imodel.context === iModel.context && imodel.imodel === iModel.imodel);
      } else if ((isSampleIModelWithAlternativeNameArray(iModelList) || isSampleIModelWithAlternativeName(iModel))) {
        let iModelLookup: SampleIModelWithAlternativeName | undefined = iModel as SampleIModelWithAlternativeName;
        if (!isSampleIModelWithAlternativeName(iModel)) {
          iModelLookup = lookupSampleIModelWithContext(iModel);
        }
        found = iModelList.find((imodel) => {
          let listLookup: SampleIModelWithAlternativeName | undefined = imodel as SampleIModelWithAlternativeName;
          if (!isSampleIModelWithAlternativeName(imodel)) {
            listLookup = lookupSampleIModelWithContext(imodel);
          }
          if (iModelLookup && listLookup) {
            return listLookup.context === iModelLookup.context && listLookup.imodel === iModelLookup.imodel;
          }
          return false;
        });
      } else {
        found = iModelList.find((listItem) => iModel === listItem);
      }

      if (!found) {
        found = !isSampleIModelWithAlternativeName(iModelList[0]) ? lookupSampleIModelWithContext(iModelList[0]) || iModelList[0] : iModelList[0];
      }

      const shouldUpdate = isSampleIModelWithAlternativeName(found) ? iModelInfo?.iModelName !== found.imodel || iModelInfo?.contextName !== found.context : found !== iModelInfo?.iModelName;
      if (shouldUpdate) {
        const info = await getIModelInfo(found);
        setiModelInfo(info);
      }
    }
  }, [iModelInfo, iModelList]);

  useEffect(() => {
    // eslint-disable-next-line no-console
    setCurrentSampleIModel(iModelParam || iModelList[0] || defaultIModel).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (iModelInfo) {
      if (iModelParam) {
        if (
          (isSampleIModelWithAlternativeName(iModelParam) && (iModelParam.context !== iModelInfo.contextName || iModelParam.imodel !== iModelInfo.iModelName))
          || iModelParam !== iModelInfo.iModelName
        ) {
          setiModelParam(iModelInfo);
        }
      } else {
        setiModelParam(iModelInfo);
      }
    } else {
      setiModelParam(undefined);
    }
  }, [iModelInfo, iModelParam, iModelList.length, setiModelParam]);

  return [iModelInfo, setCurrentSampleIModel];

};
