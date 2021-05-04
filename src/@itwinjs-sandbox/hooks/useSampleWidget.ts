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
import { FloatingWidgets } from "@itwinjs-sandbox/view/FloatingWidget";
import { useEffect } from "react";
import { SampleIModelInfo, useSampleIModelConnection } from "./useSampleIModelConnection";

export const useSampleWidget = (instructions: string, iModelList: SampleIModels[] = defaultIModelList): SampleIModelInfo | undefined => {
  const [sampleIModelInfo, setIModelName] = useSampleIModelConnection(iModelList);

  useEffect(() => {
    const floatingWidgets = new FloatingWidgets("sample-container");
    return floatingWidgets.dispose;
  }, [sampleIModelInfo]);

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
    const widgetProvider = new SampleWidgetProvider(instructions, iModelList, sampleIModelInfo, setIModelName);
    UiItemsManager.register(widgetProvider);
    return () => {
      UiItemsManager.unregister(widgetProvider.id);
    };
  }, [instructions, iModelList, sampleIModelInfo, setIModelName]);

  return sampleIModelInfo;
};
