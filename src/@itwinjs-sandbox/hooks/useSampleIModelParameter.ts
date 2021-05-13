/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { useCallback } from "react";
import { isSampleIModelWithAlternativeName, SampleIModels, SampleIModelWithAlternativeName } from "@itwinjs-sandbox/SampleIModels";

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

  // Detect if editor was enabled in URL params as a semi-backdoor, this
  // bypasses the ld feature flag
  const editorEnabled = new URLSearchParams(window.location.search).get("editor");
  if (editorEnabled) params.append("editor", editorEnabled);

  window.history.pushState(null, "", `?${params.toString()}`);

  // Send to parent if within an iframe.
  if (window.self !== window.top) {
    window.parent.postMessage(`?${params.toString()}`, "*");
  }
};

export type setSampleIModelParam = (iModel?: (SampleIModels | SampleIModelWithAlternativeName)) => void;

export const useSampleIModelParameter = (): [(SampleIModels | SampleIModelWithAlternativeName) | undefined, setSampleIModelParam] => {

  const setiModelParam = useCallback((imodel?: (SampleIModels | SampleIModelWithAlternativeName)) => {
    if (isSampleIModelWithAlternativeName(imodel)) {
      updateiModelParam(imodel.imodel, imodel.context);
    } else {
      updateiModelParam(imodel);
    }
  }, []);

  return [getiModelParam(), setiModelParam];

};
