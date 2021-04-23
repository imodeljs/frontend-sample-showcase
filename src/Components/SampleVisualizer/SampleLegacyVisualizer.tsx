/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Spinner, SpinnerSize } from "@bentley/ui-core";
import React, { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { SampleBaseApp } from "SampleBaseApp";
import { Ruleset } from "@bentley/presentation-common";
import * as HILITE_RULESET from "@bentley/presentation-frontend/lib/presentation-frontend/selection/HiliteRules.json";
import { Presentation } from "@bentley/presentation-frontend";

export interface SampleLegacyVisualizerProps {
  sampleUi: ReactNode;
}

export const SampleLegacyVisualizer: FunctionComponent<SampleLegacyVisualizerProps> = ({ sampleUi }) => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    SampleBaseApp.startup()
      .then(async () => {
        return Presentation.presentation.rulesets().add((HILITE_RULESET as any).default as Ruleset);
      })
      .then(() => {
        setAppReady(true);
      })
      .catch();
    return () => {
      SampleBaseApp.cancel();
      setAppReady(false);
    };
  }, [sampleUi]);

  if (!appReady) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  return <>{sampleUi}</>;
};