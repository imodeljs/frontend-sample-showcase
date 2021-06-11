/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { SampleGallery } from "Components/SampleGallery/SampleGallery";
import { sampleManifest } from "../../sampleManifest";
import { IModelSelector } from "@itwinjs-sandbox/components/imodel-selector/IModelSelector";
import { ActiveSample } from "./ActiveSample";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import { ErrorBoundary } from "Components/ErrorBoundary/ErrorBoundary";
import "./SampleShowcase.scss";
import "common/samples-common.scss";
import { SampleShowcaseViewHandler } from "./SampleShowcaseViewHandler";

const Editor = React.lazy(async () => import(/* webpackMode: "lazy" */ "../SampleEditor/SampleEditorContext"));
const Visualizer = React.lazy(async () => import(/* webpackMode: "lazy" */ "../SampleVisualizer/SampleVisualizer"));

export const SampleShowcase: FunctionComponent = () => {
  const [activeSample, setActiveSample] = useState(() => new ActiveSample());
  const [scrollTo, setScrollTo] = useState(true);
  const [transpileResult, setTranspileResult] = useState<string>();

  const galleryRef = React.createRef<SampleGallery>();

  useEffect(() => {
    if (activeSample.galleryVisible && scrollTo && galleryRef.current) {
      galleryRef.current.scrollToActiveSample();
      setScrollTo(false);
    }
  }, [scrollTo, galleryRef, activeSample]);

  const onGalleryCardClicked = (groupName: string, sampleName: string, wantScroll: boolean) => {
    if (transpileResult && !window.confirm("Changes made to the code will not be saved!")) {
      return;
    }
    setScrollTo(wantScroll);
    setActiveSample(new ActiveSample(groupName, sampleName));
    setTranspileResult(undefined);
  };

  const getImodelSelector = useCallback(() => {
    if (!activeSample.imodelList || !activeSample.imodelList.length || 1 >= activeSample.imodelList.length)
      return undefined;

    return (
      <div className="model-selector">
        <IModelSelector
          iModelNames={activeSample.imodelList}
          iModelName={activeSample.imodel}
          onIModelChange={(imodelName) => setActiveSample(new ActiveSample(activeSample.group, activeSample.name, imodelName))} />
      </div>);
  }, [activeSample.imodelList, activeSample.name, activeSample.group, activeSample.imodel]);

  const spinner = (<div className="uicore-fill-centered" ><Spinner size={SpinnerSize.XLarge} /></div>);

  const editor = (
    <React.Suspense fallback={spinner}>
      <Editor
        files={activeSample.getFiles}
        onSampleClicked={onGalleryCardClicked}
        onTranspiled={(blob) => setTranspileResult(blob)}
        readme={activeSample.getReadme}
        walkthrough={activeSample.walkthrough}
      />
    </React.Suspense>
  );

  const visualizer = (
    <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
      <React.Suspense fallback={spinner}>
        <ErrorBoundary key={transpileResult + activeSample.type}>
          <Visualizer
            iModelName={activeSample.imodel}
            iModelSelector={getImodelSelector()}
            transpileResult={transpileResult}
            iTwinViewerReady={activeSample.iTwinViewerReady}
            type={activeSample.type} />
        </ErrorBoundary>
      </React.Suspense>
    </div>
  );

  const gallery = activeSample.galleryVisible ? (
    <SampleGallery
      group={activeSample.group}
      onChange={onGalleryCardClicked}
      ref={galleryRef}
      samples={sampleManifest}
      selected={activeSample.name} />
  ) : undefined;

  return (
    <SampleShowcaseViewHandler editor={editor} visualizer={visualizer} gallery={gallery} />
  );
};
