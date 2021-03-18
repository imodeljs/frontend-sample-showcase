/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp } from "@bentley/imodeljs-frontend";
import { Presentation } from "@bentley/presentation-frontend";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import { MovePointTool } from "common/Geometry/InteractivePointMarker";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import React, { FunctionComponent, useEffect, useState } from "react";
import { SampleBaseApp } from "SampleBaseApp";

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
  IModelApp.i18n.unregisterNamespace(i18nNamespace);
  IModelApp.tools.unRegister(MovePointTool.toolId);
  Presentation.terminate();
  return IModelApp.shutdown().catch();
};

const iModelAppStartup = async (): Promise<void> => {
  return SampleBaseApp.startup()
    .then(() => {
      MovePointTool.register(IModelApp.i18n.registerNamespace(i18nNamespace));
    })
    .catch();
};
export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = (props) => {
  const { iTwinViewerReady, type, transpileResult, iModelName, iModelSelector } = props;
  const [appReady, setAppReady] = useState(false);
  const [sampleUi, setSampleUi] = useState<React.ReactNode>();

  useEffect(() => {
    if (!iTwinViewerReady) {
      iModelAppStartup()
        .finally(() => setAppReady(true));
    } else {
      setAppReady(true);
    }
    return () => {
      setAppReady(false);
      iModelAppShutdown();
    };
  }, [iTwinViewerReady, transpileResult]);

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
