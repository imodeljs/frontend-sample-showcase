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

interface SampleVisualizerProps {
  iTwinViewerReady?: boolean;
  sampleClass: typeof React.Component;
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
}

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = (props) => {
  const { iTwinViewerReady, sampleClass, transpileResult, iModelName, iModelSelector } = props;
  const [appReady, setAppReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sampleUi, setSampleUi] = useState<React.ReactNode>();

  useEffect(() => {
    if (!iTwinViewerReady) {
      SampleBaseApp.startup()
        .then(() => {
          MovePointTool.register(IModelApp.i18n.registerNamespace(i18nNamespace));
        })
        .catch()
        .finally(() => setAppReady(true));
    } else {
      setAppReady(true)
    }
    return () => {
      setAppReady(false);
      iModelAppShutdown()
    }
  }, [iTwinViewerReady]);

  // Set sample UI
  useEffect(() => {
    try {
      if (sampleClass && ((!iTwinViewerReady && appReady) || iTwinViewerReady)) {
        setSampleUi(React.createElement(sampleClass, { iModelName, iModelSelector } as any))
      }
    } catch (error) {
      setSampleUi(<DisplayError error={error} />)
    }
  }, [sampleClass, iModelName, iModelSelector, iTwinViewerReady, appReady]);

  // Refresh sample UI on transpile
  useEffect(() => {
    if (transpileResult) {
      setLoading(true);
      iModelAppShutdown()
        .then(() => {
          import( /* webpackIgnore: true */ transpileResult).then((module) => {
            const component = module.default as React.ComponentClass<SampleProps>;
            setSampleUi(React.createElement(component, { iModelName, iModelSelector }));
            setLoading(false);
          })
        })
    }
  }, [transpileResult, iModelName, iModelSelector]);


  if (!appReady) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  if (loading) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  return <>{sampleUi}</>;
}

export default SampleVisualizer;
