import { IModelApp } from "@bentley/imodeljs-frontend";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import { MovePointTool } from "common/Geometry/InteractivePointMarker";
import { DisplayError } from "Components/ErrorBoundary/ErrorDisplay";
import React, { FunctionComponent, useEffect, useState } from "react";
import { SampleBaseApp } from "SampleBaseApp";

const i18nNamespace = "sample-showcase-i18n-namespace";
const context = (require as any).context('./../../frontend-samples', true, /\.tsx$/);

type SampleVisualizerProps = {
  type: string,
  iModelName: string,
  iModelSelector: React.ReactNode,
  transpileResult?: string,
}

type SampleProps = {
  iModelName: string,
  iModelSelector: React.ReactNode,
}

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = (props) => {
  const { type, transpileResult, iModelName, iModelSelector } = props;
  const [appReady, setAppReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [sampleUi, setSampleUi] = useState<React.ReactNode>();

  // Initialize imodeljs BaseApp
  useEffect(() => {
    if (!appReady) {
      SampleBaseApp.startup()
        .then(() => {
          setAppReady(true);
          MovePointTool.register(IModelApp.i18n.registerNamespace(i18nNamespace));
        })
        .catch(error => {
          console.error("SampleBaseApp.startup failure", error);
          setAppReady(true);
        });
    }
    return () => {
      IModelApp.i18n.unregisterNamespace(i18nNamespace);
      IModelApp.tools.unRegister(MovePointTool.toolId);
    }
  }, [appReady]);

  // Set sample UI 
  useEffect(() => {
    const key = context.keys().find((key: string) => key.includes(type));
    try {
      if (key) {
        const sampleUi = context(key).default as React.ComponentClass<SampleProps>;
        setSampleUi(React.createElement(sampleUi, { iModelName, iModelSelector }));
      } else {
        setSampleUi(<div>Failed to resolve sample '{type}'</div>);
      }
    }
    catch (error) {
      setSampleUi(<DisplayError error={error} />)
    }
  }, [type, iModelName]);

  // Refresh sample UI on transpile
  useEffect(() => {
    if (transpileResult) {
      setLoading(true);
      import( /* webpackIgnore: true */ transpileResult).then(module => {
        const sampleUi = module.default as React.ComponentClass<SampleProps>;
        setSampleUi(React.createElement(sampleUi, { iModelName, iModelSelector }));
        setLoading(false);
      })
    }
  }, [transpileResult]);


  if (!appReady) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  if (loading) {
    return (<div className="uicore-fill-centered"><Spinner size={SpinnerSize.XLarge} /></div>);
  }

  return <>{sampleUi}</>;
}

export default SampleVisualizer;
