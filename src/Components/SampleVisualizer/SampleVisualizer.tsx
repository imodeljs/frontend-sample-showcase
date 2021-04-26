/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useEffect, useState } from "react";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Presentation } from "@bentley/presentation-frontend";
import { AuthorizationClient } from "@itwinjs-sandbox/authentication/AuthorizationClient";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import { UiFramework } from "@bentley/ui-framework";
import { Spinner, SpinnerSize, UiCore } from "@bentley/ui-core";
import { UiComponents } from "@bentley/ui-components";
import { SampleLegacyVisualizer } from "./SampleLegacyVisualizer";
const context = (require as any).context("./../../frontend-samples", true, /\.tsx$/);

interface SampleVisualizerProps {
  iTwinViewerReady?: boolean;
  type: string;
  iModelName: string;
  iModelSelector: React.ReactNode;
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

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = ({ iTwinViewerReady, type, transpileResult, iModelName, iModelSelector }) => {
  const [sampleUi, setSampleUi] = useState<React.ReactNode>();
  const [appReady, setAppReady] = useState<boolean>(false);
  const [cleaning, setCleaning] = useState<boolean>(false);

  useEffect(() => {
    setAppReady(false);
    setCleaning(true);
    iModelAppShutdown()
      .then(() => {
        setCleaning(false);
      });
  }, [iTwinViewerReady, type, transpileResult, iModelName, iModelSelector]);

  useEffect(() => {
    if (sampleUi && !cleaning) {
      AuthorizationClient
        .initializeOidc()
        .then(() => {
          setAppReady(true);
        });
    }
  }, [sampleUi, cleaning]);

  // Set sample UI
  useEffect(() => {
    const key = context.keys().find((k: string) => k.includes(type));
    try {
      if (key) {
        const component = context(key).default as React.ComponentClass<SampleProps>;
        setSampleUi(React.createElement(component, { iModelName, iModelSelector, key: Math.random() * 100 }));
      } else {
        setSampleUi(<div>Failed to resolve sample &quot;{type}&quot;</div>);
      }
    } catch (error) {
      setSampleUi(<DisplayError error={error} />);
    }
  }, [type, iModelName, iModelSelector]);

  // Refresh sample UI on transpile
  useEffect(() => {
    if (transpileResult) {
      import( /* webpackIgnore: true */ transpileResult).then((module) => {
        const component = module.default as React.ComponentClass<SampleProps>;
        setSampleUi(React.createElement(component, { iModelName, iModelSelector }));
      });
    }
  }, [transpileResult, iModelName, iModelSelector]);

  if (!appReady || !sampleUi || cleaning) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  return !iTwinViewerReady ? <SampleLegacyVisualizer sampleUi={sampleUi} /> : <>{sampleUi}</>;
};

export default React.memo(SampleVisualizer, (prevProps, nextProps) => {
  return prevProps.type === nextProps.type && prevProps.iModelName === nextProps.iModelName && prevProps.transpileResult === nextProps.transpileResult;
});
