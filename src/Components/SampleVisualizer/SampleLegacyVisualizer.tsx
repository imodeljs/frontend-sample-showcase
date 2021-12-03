/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Spinner, SpinnerSize } from "@itwin/core-react";
import React, { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { SampleBaseApp } from "SampleBaseApp";

export interface SampleLegacyVisualizerProps {
  sampleUi: ReactNode;
}

async function retry<T>(retries: number, executor: Promise<T>) {
  return executor.catch((error) => {
    if (retries > 0 && error !== "Cancelled") {
      retry(retries - 1, executor)
        .catch((retryError) => {
          // eslint-disable-next-line no-console
          console.error(retryError);
        });
    } else {
      if (error !== "Cancelled") {
        // eslint-disable-next-line no-console
        console.error(error);
      }
    }
  });
}

export const SampleLegacyVisualizer: FunctionComponent<SampleLegacyVisualizerProps> = ({ sampleUi }) => {
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    SampleBaseApp.cancel();
    retry(2, SampleBaseApp.startup()
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      }))
      .then(() => {
        setAppReady(true);
      })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
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
