import React, { FunctionComponent, useEffect, useState } from "react";
import { SampleBaseApp } from "SampleBaseApp";
import * as Registry from "./../../frontend-samples/registry";

const ComponentRegistry = Registry as Record<string, any>;

type SampleVisualizerProps = {
  type: string;
  iModelName: string;
  iModelSelector: React.ReactNode;
  transpileResult?: string;
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
        })
        .catch(error => {
          console.error("SampleBaseApp.startup failure", error);
          setAppReady(true);
        });
    }
  }, [appReady]);

  // Set sample UI 
  useEffect(() => {
    if (!ComponentRegistry[type])
      setSampleUi(<div>Failed to resolve by type {type}</div>);
    else
      setSampleUi(React.createElement(ComponentRegistry[type], { iModelName, iModelSelector }));
  }, [type, iModelName, iModelSelector])

  // Refresh sample UI on transpile
  useEffect(() => {
    if (transpileResult) {
      setLoading(true);
      import( /* webpackIgnore: true */ transpileResult).then(module => {
        const sampleUi = module.default as typeof React.Component;
        setSampleUi(sampleUi);
        setLoading(false);
      })
    }
  }, [type, transpileResult]);


  if (!appReady) {
    return (<div>SampleBaseApp.startup...</div>);
  }

  if (loading) {
    return (<div>Transpile loading...</div>);
  }

  return <>{sampleUi}</>;
}

export default SampleVisualizer;