/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { UiItemsManager } from "@bentley/ui-abstract";
import { SampleWidgetProvider } from "@itwinjs-sandbox/components/imodel-selector/SampleWidgetProvider";
import { defaultIModelList } from "@itwinjs-sandbox/constants";
import { SampleIModels, SampleIModelWithAlternativeName } from "@itwinjs-sandbox/SampleIModels";
import { FloatingWidgets } from "@itwinjs-sandbox/hooks/FloatingWidget";
import { useEffect, useRef } from "react";
import { SampleIModelInfo, useSampleIModelConnection } from "./useSampleIModelConnection";
import { UiFramework } from "@bentley/ui-framework";

export const useSampleWidget = (instructions: string, iModelList: (SampleIModels | SampleIModelWithAlternativeName)[] = defaultIModelList): SampleIModelInfo | undefined => {
  const [sampleIModelInfo, setIModelName] = useSampleIModelConnection(iModelList);
  const floatingWidgets = useRef<FloatingWidgets>();

  useEffect(() => {
    floatingWidgets.current = new FloatingWidgets("sample-container");
    return floatingWidgets.current.dispose;
  }, []);

  useEffect(() => {
    const widgetProvider = new SampleWidgetProvider(instructions, iModelList, sampleIModelInfo, setIModelName);
    UiItemsManager.register(widgetProvider);
    floatingWidgets.current?.resetWidgets();
    return () => {
      if (UiFramework.initialized) {
        UiItemsManager.unregister(widgetProvider.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleIModelInfo]);

  return sampleIModelInfo;
};
