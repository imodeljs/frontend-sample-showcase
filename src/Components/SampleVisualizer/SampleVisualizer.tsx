/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, ReactNode, useEffect, useRef, useState } from "react";
import { IModelApp } from "@itwin/core-frontend";
import { Presentation } from "@itwin/presentation-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import { UiFramework } from "@itwin/appui-react";
import { Spinner, SpinnerSize, UiCore } from "@itwin/core-react";
import { UiComponents } from "@itwin/components-react";
import path from "path";
const context = (require as any).context("./../../frontend-samples", true, /\.tsx$/);

interface SampleVisualizerProps {
  type: string;
}

const iModelAppShutdown = async (): Promise<void> => {
  try {
    Presentation.presentation.dispose();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
  try {
    Presentation.terminate();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
  try {
    if (UiFramework.initialized) {
      UiFramework.terminate();
    }
  } catch (err) {
    // Do nothing.
  }
  try {
    if (UiComponents.initialized) {
      UiComponents.terminate();
    }
  } catch (err) {
    // Do nothing.
  }
  try {
    if (UiCore.initialized) {
      UiCore.terminate();
    }
  } catch (err) {
    // Do nothing
  }
  try {
    IModelApp.localization.getLanguageList().forEach((ns) => IModelApp.localization.unregisterNamespace(ns));
  } catch (err) {
    // Do nothing
  }
  try {
    await IModelApp.shutdown();
  } catch (err) {
    // Do nothing
  }
};

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = ({ type }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [sampleUi, setSampleUi] = useState<ReactNode>(null);

  useEffect(() => {
    setSampleUi(null);

    setImmediate(async () => {
      await iModelAppShutdown();
      let componentElement = <></>;
      try {
        const key = context.keys().find((k: string) => path.basename(k) === type);
        if (key) {
          const component = context(key).default as React.ComponentClass;
          componentElement = React.createElement(component, { key: Math.random() * 100 });
        } else {
          componentElement = <div>Failed to resolve sample &quot;{type}&quot;</div>;
        }
        await AuthorizationClient.initializeOidc();
      } catch (error) {
        if (error instanceof Error) {
          componentElement = <DisplayError error={error} />;
        }
      }

      setSampleUi(componentElement);
    });

  }, [type]);

  return <div ref={ref} style={{ height: "100%", width: "100%" }}>{sampleUi ? sampleUi : <div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>}</div>;
};

export default React.memo(SampleVisualizer, (prevProps, nextProps) => {
  return prevProps.type === nextProps.type;
});
