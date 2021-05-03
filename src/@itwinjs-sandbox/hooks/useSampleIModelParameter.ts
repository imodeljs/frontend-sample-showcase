/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { useCallback, useEffect, useState } from "react";
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";

const getiModelParam = () => {
  const params = new URLSearchParams(window.location.search);
  const imodel = params.get("imodel") ?? undefined;
  return imodel as SampleIModels | undefined;
};

const updateiModelParam = (imodel?: string) => {
  const params = new URLSearchParams(window.location.search);

  if (imodel) {
    if (params.has("imodel")) {
      params.set("imodel", imodel);
    } else {
      params.append("imodel", imodel);
    }
  } else {
    params.delete("imodel");
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
};

export type setSampleIModelParam = (iModel?: SampleIModels) => void;

export const useSampleIModelParameter = (): [SampleIModels | undefined, setSampleIModelParam] => {
  const [iModel, setIModel] = useState<SampleIModels | undefined>(getiModelParam());

  useEffect(() => {
    const imodelParam = getiModelParam();
    if (iModel !== imodelParam) {
      setIModel(imodelParam);
    }
  }, [iModel]);

  const setiModelParam = useCallback((imodel?: SampleIModels) => {
    updateiModelParam(imodel);
    setIModel(imodel);
  }, []);

  return [iModel, setiModelParam];

};
