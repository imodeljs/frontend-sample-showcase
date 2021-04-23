/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Spinner, SpinnerSize } from "@bentley/ui-core";
import React, { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { SampleBaseApp } from "SampleBaseApp";

export interface SampleLegacyVisualizerProps {
  sampleUi: ReactNode;
}

export const SampleLegacyVisualizer: FunctionComponent<SampleLegacyVisualizerProps> = ({ sampleUi }) => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    SampleBaseApp.startup()
      .then(() => {
        setAppReady(true);
      })
      .catch((_) => {
        // do nothing
      });
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
