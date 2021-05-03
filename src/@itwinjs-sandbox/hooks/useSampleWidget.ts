/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { RegisteredRuleset, Ruleset } from "@bentley/presentation-common";
import { Presentation } from "@bentley/presentation-frontend";
import * as HILITE_RULESET from "@bentley/presentation-frontend/lib/presentation-frontend/selection/HiliteRules.json";
import { UiItemsManager } from "@bentley/ui-abstract";
import { SampleWidgetProvider } from "@itwinjs-sandbox/components/imodel-selector/SampleWidgetProvider";
import { defaultIModelList } from "@itwinjs-sandbox/constants";
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
// import { FloatingWidgetsManager } from "@itwinjs-sandbox/widgets/FloatingWidgets";
import { useEffect, useState } from "react";
import { useFloatingWidget } from "./useFloatingWidget";
import { SampleIModelInfo, useSampleIModelConnection } from "./useSampleIModelConnection";
import "./useSampleWidget.scss";

export const useSampleWidget = (instructions: string, iModelList?: SampleIModels[]): SampleIModelInfo | undefined => {
  useFloatingWidget("sample-container");
  const [sampleIModels, setSampleIModels] = useState<SampleIModels[]>(iModelList || defaultIModelList);
  const [sampleIModelInfo, setIModelName] = useSampleIModelConnection(sampleIModels);

  useEffect(() => {
    if (iModelList && !sampleIModels.every((el) => iModelList.includes(el))) {
      setSampleIModels(iModelList);
    }
  }, [iModelList, sampleIModels]);

  /**
   * Fix to add Hilite ruleset to presentation until Bug #599922 is addressed
   */
  useEffect(() => {
    const addHiliteRuleset = async () => {
      try {
        if (Presentation.presentation) {
          const ruleset: RegisteredRuleset | undefined = await Presentation.presentation.rulesets().get("presentation-frontend/HiliteRules");
          if (!ruleset) {
            await Presentation.presentation.rulesets().add((HILITE_RULESET as any).default as Ruleset);
          }
        }
      } catch {
        // Presentation not initialized
      }
    };
    addHiliteRuleset();
  });

  useEffect(() => {
    const widgetProvider = new SampleWidgetProvider(instructions, sampleIModels, sampleIModelInfo, setIModelName);
    UiItemsManager.register(widgetProvider);
    return () => {
      UiItemsManager.unregister(widgetProvider.id);
    };
  }, [instructions, sampleIModels, sampleIModelInfo, setIModelName]);

  return sampleIModelInfo;
};
