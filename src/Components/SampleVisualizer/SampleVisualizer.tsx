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
import { runWithCancel } from "common/CancellablePromises/CancellablePromises";
import { UiFramework } from "@bentley/ui-framework";
import { UiCore } from "@bentley/ui-core";
import { UiComponents } from "@bentley/ui-components";

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
    UiFramework.terminate();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
  try {
    UiComponents.terminate();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
  try {
    UiCore.terminate();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
  try {
    await IModelApp.shutdown();
  } catch (err) {
    // Do nothing, its possible that we never started.
  }
};

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = ({ iTwinViewerReady, type, transpileResult, iModelName, iModelSelector }) => {
  const [appReady, setAppReady] = useState(false);
  const [sampleUi, setSampleUi] = useState<React.ReactNode>();

  useEffect(() => {
    const cancellations: Function[] = [];
    function* iModelAppStartup() {
      yield iModelAppShutdown();
      yield AuthorizationClient.initializeOidc();

      if (!iTwinViewerReady) {
        const startup = runWithCancel(SampleBaseApp.startup);
        cancellations.push(startup.cancel);
        yield startup.promise;
        MovePointTool.register(IModelApp.i18n.registerNamespace(i18nNamespace));
      }

    }
    const iModelAppCancellable = runWithCancel(iModelAppStartup);
    cancellations.push(iModelAppCancellable.cancel);
    iModelAppCancellable.promise
      .then(() => {
        setAppReady(true);
      })
      .catch((error) => {
        if (error.reason !== "cancelled") {
          // eslint-disable-next-line no-console
          console.error(error);
        }
      });
    return () => {
      setAppReady(false);
      cancellations.forEach((cancel) => cancel());
    };
  }, [iTwinViewerReady, transpileResult, type]);

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

  if (!appReady) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  return <>{sampleUi}</>;
};

export default React.memo(SampleVisualizer, (prevProps, nextProps) => {
  return prevProps.type === nextProps.type && prevProps.iModelName === nextProps.iModelName && prevProps.transpileResult === nextProps.transpileResult;
});
