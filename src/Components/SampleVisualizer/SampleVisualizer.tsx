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

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = (props) => {
  const { iTwinViewerReady, sampleClass, transpileResult, iModelName, iModelSelector } = props;
  const [appReady, setAppReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sampleUi, setSampleUi] = useState<React.ReactNode>();

  // Initialize imodeljs BaseApp
  useEffect(() => {
    if (!appReady && !iTwinViewerReady) {
      SampleBaseApp.startup()
        .then(() => {
          setAppReady(true);
          MovePointTool.register(IModelApp.i18n.registerNamespace(i18nNamespace));
        })
        .catch(() => {
          setAppReady(true);
        });
    }
    return () => {
      IModelApp.i18n.unregisterNamespace(i18nNamespace);
      IModelApp.tools.unRegister(MovePointTool.toolId);
    }
  }, [appReady, iTwinViewerReady]);

  // Set sample UI
  useEffect(() => {
    try {
      if (sampleClass) {
        Promise.resolve(Presentation.terminate())
          .then(async () => {
            return IModelApp.shutdown()
          })
          .then(() => {
            setAppReady(false)
          })
          .catch()
          .then(() => {
            setSampleUi(React.createElement(sampleClass, { iModelName, iModelSelector } as any))
          });
      }
    } catch (error) {
      setSampleUi(<DisplayError error={error} />)
    }
  }, [sampleClass, iModelName, iModelSelector]);

  // Refresh sample UI on transpile
  useEffect(() => {
    if (transpileResult) {
      setLoading(true);
      import( /* webpackIgnore: true */ transpileResult).then((module) => {
        const component = module.default as React.ComponentClass<SampleProps>;
        setSampleUi(React.createElement(component, { iModelName, iModelSelector }));
        setLoading(false);
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
