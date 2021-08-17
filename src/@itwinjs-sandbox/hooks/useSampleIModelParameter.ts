/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { useCallback } from "react";
import { SampleIModels, SampleIModelWithAlternativeName } from "@itwinjs-sandbox/SampleIModels";
import { SampleIModelInfo } from "./useSampleIModelConnection";

const getiModelParam = () => {
  const params = new URLSearchParams(window.location.search);
  const imodel = params.get("imodel") ?? undefined;
  const context = params.get("context") ?? undefined;
  if (context && imodel) {
    return { context, imodel } as SampleIModelWithAlternativeName;
  }
  return imodel as SampleIModels | undefined;
};

const updateiModelParam = (imodel?: string, context?: string) => {
  const params = new URLSearchParams(window.location.search);

  const setOrDeleteParam = (name: string, value?: string) => {
    if (value) {
      if (params.has(name)) {
        params.set(name, value);
      } else {
        params.append(name, value);
      }
    } else {
      params.delete(name);
    }
  };

  setOrDeleteParam("context", context);
  setOrDeleteParam("imodel", imodel);

  window.history.pushState(null, "", `?${params.toString()}`);
  if (window.self !== window.top) {
    window.parent.postMessage(`?${params.toString()}`, "*");
  }
};

export type setSampleIModelParam = (iModel?: SampleIModelInfo) => void;

export const useSampleIModelParameter = (): [(SampleIModels | SampleIModelWithAlternativeName) | undefined, setSampleIModelParam] => {

  const setiModelParam = useCallback((imodel?: SampleIModelInfo) => {
    if (imodel) {
      if (imodel.contextName !== imodel.iModelName) {
        updateiModelParam(imodel.iModelName, imodel.contextName);
      } else {
        updateiModelParam(imodel.iModelName);
      }
    } else {
      updateiModelParam(undefined);
    }
  }, []);

  return [getiModelParam(), setiModelParam];

};
