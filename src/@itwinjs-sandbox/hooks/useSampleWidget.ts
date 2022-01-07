/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { UiItemsManager } from "@itwin/appui-abstract";
import { UiFramework } from "@itwin/appui-react";
import { SampleWidgetProvider } from "../components/imodel-selector/SampleWidgetProvider";
import { defaultIModelList, SampleIModels } from "../SampleIModels";
import { useEffect } from "react";
import { SampleIModelInfo, useSampleIModelConnection } from "./useSampleIModelConnection";

export const useSampleWidget = (instructions: string, iModelList: SampleIModels[] = defaultIModelList): SampleIModelInfo | undefined => {
  const [sampleIModelInfo, setIModelName] = useSampleIModelConnection(iModelList);

  useEffect(() => {
    const widgetProvider = new SampleWidgetProvider(instructions, iModelList, sampleIModelInfo, setIModelName);
    UiItemsManager.register(widgetProvider);
    return () => {
      if (UiFramework.initialized) {
        UiItemsManager.unregister(widgetProvider.id);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sampleIModelInfo]);

  return sampleIModelInfo;
};
