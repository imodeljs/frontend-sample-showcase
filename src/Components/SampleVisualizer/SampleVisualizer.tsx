/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, ReactNode, useEffect, useRef, useState } from "react";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Presentation } from "@bentley/presentation-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox/authentication/AuthorizationClient";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import { UiFramework } from "@bentley/ui-framework";
import { Spinner, SpinnerSize, UiCore } from "@bentley/ui-core";
import { UiComponents } from "@bentley/ui-components";
import path from "path";
const context = (require as any).context("./../../frontend-samples", true, /\.tsx$/);

interface SampleVisualizerProps {
  type: string;
  transpileResult?: string;
}

interface SampleProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
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
    IModelApp.i18n.languageList().forEach((ns) => IModelApp.i18n.unregisterNamespace(ns));
  } catch (err) {
    // Do nothing
  }
  try {
    await IModelApp.shutdown();
  } catch (err) {
    // Do nothing
  }
};

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = ({ type, transpileResult }) => {
  const ref = useRef<HTMLDivElement>(null);
  const currentProps = useRef<SampleVisualizerProps>({ type, transpileResult });
  const [sampleUi, setSampleUi] = useState<ReactNode>(null);

  useEffect(() => {
    setSampleUi(null);

    setImmediate(async () => {
      await iModelAppShutdown();
      let componentElement = <></>;
      try {
        if (transpileResult) {
          const module = await import( /* webpackIgnore: true */ transpileResult);
          const component = module.default as React.ComponentClass<SampleProps>;
          componentElement = React.createElement(component);
        } else {
          const key = context.keys().find((k: string) => path.basename(k) === type);
          if (key) {
            const component = context(key).default as React.ComponentClass;
            componentElement = React.createElement(component, { key: Math.random() * 100 });
          } else {
            componentElement = <div>Failed to resolve sample &quot;{type}&quot;</div>;
          }
        }
        await AuthorizationClient.initializeOidc();
      } catch (error) {
        componentElement = <DisplayError error={error} />;
      }

      if (ref.current && currentProps.current.type === type && currentProps.current.transpileResult === transpileResult) {
        setSampleUi(componentElement);
      }
    });

  }, [type, transpileResult]);

  return <div ref={ref} style={{ height: "100%", width: "100%" }}>{sampleUi ? sampleUi : <div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>}</div>;
};

export default React.memo(SampleVisualizer, (prevProps, nextProps) => {
  return prevProps.type === nextProps.type && prevProps.transpileResult === nextProps.transpileResult;
});
