/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { createRef, FunctionComponent, lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SampleGallery } from "Components/SampleGallery/SampleGallery";
import { sampleManifest } from "../../sampleManifest";
import { ActiveSample } from "./ActiveSample";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import { ErrorBoundary } from "Components/ErrorBoundary/ErrorBoundary";
import "./SampleShowcase.scss";
import "common/samples-common.scss";
import { SampleShowcaseViewHandler } from "./SampleShowcaseViewHandler";
import { ProgressRadial } from "@itwin/itwinui-react";
import { SampleIframeVisualizer } from "Components/SampleVisualizer/SampleIframeVisualizer";

const Editor = lazy(async () => import(/* webpackMode: "lazy" */ "../SampleEditor/SampleEditorContext"));
const Visualizer = lazy(async () => import(/* webpackMode: "lazy" */ "../SampleVisualizer/SampleVisualizer"));

export const SampleShowcase: FunctionComponent = () => {
  const [activeSample, setActiveSample] = useState(() => new ActiveSample());
  const [scrollTo, setScrollTo] = useState(true);
  const [transpiled, setTranspiled] = useState<boolean>(false);

  const galleryRef = createRef<SampleGallery>();
  const iframe = useRef<HTMLIFrameElement | null>(null);

  useEffect(() => {
    if (activeSample.galleryVisible && scrollTo && galleryRef.current) {
      galleryRef.current.scrollToActiveSample();
      setScrollTo(false);
    }
  }, [scrollTo, galleryRef, activeSample]);

  const spinner = useMemo(() => (<div className="uicore-fill-centered" ><ProgressRadial indeterminate size="large" /></div>), []);

  const onGalleryCardClicked = useCallback((groupName: string | null, sampleName: string | null, wantScroll: boolean) => {
    if (transpiled && !window.confirm("Changes made to the code will not be saved!")) {
      return;
    }
    setScrollTo(wantScroll);
    setActiveSample(() => new ActiveSample(groupName, sampleName));
    setTranspiled(false);
  }, [transpiled]);

  const editor = useMemo(() => (
    <Suspense fallback={spinner}>
      <Editor
        iframeRef={iframe}
        files={activeSample.getFiles}
        onSampleClicked={onGalleryCardClicked}
        onRunClick={() => setTranspiled(true)}
        readme={activeSample.getReadme}
        walkthrough={activeSample.getWalkthrough}
      />
    </Suspense>
  ), [activeSample.getFiles, activeSample.getReadme, activeSample.getWalkthrough, onGalleryCardClicked, spinner]);

  const visualizer = useMemo(() => (
    <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
      {<SampleIframeVisualizer key={activeSample.type} ref={iframe} hidden={!transpiled} />}
      {!transpiled && <Suspense fallback={spinner}>
        <ErrorBoundary key={activeSample.type}>
          <Visualizer
            type={activeSample.type} />
        </ErrorBoundary>
      </Suspense>}
    </div>
  ), [activeSample.type, spinner, transpiled]);

  const gallery = useMemo(() => (activeSample.galleryVisible ? (
    <SampleGallery
      group={activeSample.group}
      onChange={onGalleryCardClicked}
      ref={galleryRef}
      samples={sampleManifest}
      selected={activeSample.name} />
  ) : undefined), [activeSample.galleryVisible, activeSample.group, activeSample.name, galleryRef, onGalleryCardClicked]);

  return (
    <SampleShowcaseViewHandler editor={editor} visualizer={visualizer} gallery={gallery} />
  );
};
