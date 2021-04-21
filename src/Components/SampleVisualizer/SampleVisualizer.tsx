/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useEffect, useState } from "react";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { Presentation } from "@bentley/presentation-frontend";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import { AuthorizationClient } from "@itwinjs-sandbox/authentication/AuthorizationClient";
import { MovePointTool } from "common/Geometry/InteractivePointMarker";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import { SampleBaseApp } from "SampleBaseApp";
import { Ruleset } from "@bentley/presentation-common";
import * as HILITE_RULESET from "@bentley/presentation-frontend/lib/presentation-frontend/selection/HiliteRules.json";

const i18nNamespace = "sample-showcase-i18n-namespace";
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
  if (IModelApp.i18n && IModelApp.i18n.getNamespace(i18nNamespace)) {
    IModelApp.i18n.unregisterNamespace(i18nNamespace);
  }
  if (IModelApp.tools && IModelApp.tools.find(MovePointTool.toolId)) {
    IModelApp.tools.unRegister(MovePointTool.toolId);
  }
  try {
    Presentation.terminate();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
  try {
    await IModelApp.shutdown();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
};

const iModelAppStartup = async (signal: AbortSignal): Promise<void> => {
  await SampleBaseApp.startup(signal);
  if (signal.aborted) {
    throw new DOMException("Aborted", "Abort");
  }
  MovePointTool.register(IModelApp.i18n.registerNamespace(i18nNamespace));
};

let abortController = new AbortController();

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = ({ iTwinViewerReady, type, transpileResult, iModelName, iModelSelector }) => {
  const [appReady, setAppReady] = useState(false);
  const [sampleUi, setSampleUi] = useState<React.ReactNode>();

  useEffect(() => {
    const debounce = setTimeout(() => {
      abortController.abort();
      abortController = new AbortController();
      const initialize = async (signal: AbortSignal) => {
        try {
          await iModelAppShutdown();

          if (signal.aborted) {
            throw new DOMException("Aborted", "Abort");
          }

          await AuthorizationClient.initializeOidc();

          if (!iTwinViewerReady) {
            await iModelAppStartup(signal);
            // Fix to add Hilite ruleset until Bug #599922 is addressed
            await Presentation.presentation.rulesets().add((HILITE_RULESET as any).default as Ruleset);
          }

          setAppReady(true);

        } catch (err) {
        }
      };
      initialize(abortController.signal);
    }, 1000);
    return () => {
      clearTimeout(debounce);
    };
  }, [iTwinViewerReady, transpileResult, type]);

  // Set sample UI
  useEffect(() => {
    const key = context.keys().find((k: string) => k.includes(type));
    try {
      if (key) {
        const component = context(key).default as React.ComponentClass<SampleProps>;
        setSampleUi(React.createElement(component, { iModelName, iModelSelector }));
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

  if (!appReady) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  return <>{sampleUi}</>;
};

export default React.memo(SampleVisualizer, (prevProps, nextProps) => {
  return prevProps.type === nextProps.type && prevProps.iModelName === nextProps.iModelName && prevProps.transpileResult === nextProps.transpileResult;
});
