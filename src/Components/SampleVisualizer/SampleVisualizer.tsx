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
import { FrontstageManager } from "@bentley/ui-framework";
import { FloatingWidgetsManager } from "@itwinjs-sandbox/widgets/FloatingWidgets";

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

const iModelAppStartup = async (): Promise<void> => {
  await SampleBaseApp.startup();
  MovePointTool.register(IModelApp.i18n.registerNamespace(i18nNamespace));
};

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = ({ iTwinViewerReady, type, transpileResult, iModelName, iModelSelector }) => {
  const [appReady, setAppReady] = useState(false);
  const [sampleUi, setSampleUi] = useState<React.ReactNode>();
  const [shuttingDown, setShuttingDown] = useState<boolean>(false);

  useEffect(() => {
    if (!shuttingDown) {
      FrontstageManager.onFrontstageReadyEvent.addOnce(FloatingWidgetsManager.onFrontstageReadyListener);
      AuthorizationClient.initializeOidc()
        .then(() => {
          if (!iTwinViewerReady) {
            iModelAppStartup()
              .finally(() => setAppReady(true));
          } else {
            setAppReady(true);
          }
        });
      return () => {
        setShuttingDown(true);
        setAppReady(false);
        iModelAppShutdown()
          .then(() => setShuttingDown(false));
      };
    }
    return;
  }, [iTwinViewerReady, transpileResult, type, shuttingDown]);

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
