/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { UiItemsManager } from "@bentley/ui-abstract";
import { useActiveFrontstageDef } from "@bentley/ui-framework";
import { SampleWidgetProvider } from "@itwinjs-sandbox/components/imodel-selector/SampleWidgetProvider";
import { defaultIModelList } from "@itwinjs-sandbox/constants";
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { FloatingWidgetsManager } from "@itwinjs-sandbox/widgets/FloatingWidgets";
import { useEffect, useState } from "react";
import { SampleIModelInfo, useSampleIModelConnection } from "./useSampleIModelConnection";

export const useSampleWidget = (instructions: string, iModelList?: SampleIModels[]): SampleIModelInfo | undefined => {
  const [sampleIModels, setSampleIModels] = useState<SampleIModels[]>(iModelList || defaultIModelList);
  const [sampleIModelInfo, setIModelName] = useSampleIModelConnection(sampleIModels);
  const frontstage = useActiveFrontstageDef();

  useEffect(() => {
    if (frontstage) {
      FloatingWidgetsManager.onFrontstageReady(frontstage);
    }
    return;
  }, [frontstage]);

  useEffect(() => {
    if (iModelList && !sampleIModels.every((el) => iModelList.includes(el))) {
      setSampleIModels(iModelList);
    }
  }, [iModelList, sampleIModels]);

  useEffect(() => {
    const widgetProvider = new SampleWidgetProvider(instructions, sampleIModels, setIModelName);
    UiItemsManager.register(widgetProvider);
    return () => {
      UiItemsManager.unregister(widgetProvider.id);
    };
  }, [instructions, sampleIModels, setIModelName]);

  return sampleIModelInfo;

};
