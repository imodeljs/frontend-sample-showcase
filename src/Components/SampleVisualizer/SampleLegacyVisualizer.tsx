/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Spinner, SpinnerSize } from "@bentley/ui-core";
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from "react";
import { SampleBaseApp } from "SampleBaseApp";

export interface SampleLegacyVisualizerProps {
  sampleUi: ReactNode;
}

async function retry<T>(retries: number, executor: Promise<T>) {
  return executor.catch((error) => {
    if (retries > 0 && error !== "Cancelled") {
      retry(retries - 1, executor);
    } else {
      if (error !== "Cancelled") {
        console.error(error);
      }
    }
  });
}

export const SampleLegacyVisualizer: FunctionComponent<SampleLegacyVisualizerProps> = ({ sampleUi }) => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    SampleBaseApp.cancel();
    retry(2, SampleBaseApp.startup())
      .then(() => {
        setAppReady(true);
      });
    return () => {
      setAppReady(false);
    };
  }, []);

  if (!appReady) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  return <>{sampleUi}</>;
};
