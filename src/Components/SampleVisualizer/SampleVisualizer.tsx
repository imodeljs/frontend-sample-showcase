import { ErrorBoundary } from "Components/ErrorBoundary/ErrorBoundary";
import React, { FunctionComponent, useEffect, useState } from "react";
import { SampleBaseApp } from "SampleBaseApp";
import * as Registry from "./../../frontend-samples/registry";

const ComponentRegistry = Registry as Record<string, any>;

type SampleVisualizerProps = {
  type: string;
  iModelName: string;
  iModelSelector: React.ReactNode;
}

export const SampleVisualizer: FunctionComponent<SampleVisualizerProps> = (props) => {
  const { type } = props;
  const [appReady, setAppReady] = useState(false);

  useEffect(() => {
    if (!appReady) {
      SampleBaseApp.startup().then(() => {
        setAppReady(true);
      });
    }
  }, [appReady]);

  ComponentRegistry[type];

  if (!ComponentRegistry[type])
    return <div>Failed to resolve component by type '{type}'</div>


  return (
    <ErrorBoundary>
      {!appReady ? <div>SampleBaseApp.startup...</div> : React.createElement(ComponentRegistry[type], props)}
    </ErrorBoundary>
  )
}