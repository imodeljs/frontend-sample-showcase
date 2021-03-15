/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { SampleGallery } from "Components/SampleGallery/SampleGallery";
import { sampleManifest } from "../../sampleManifest";
import { IModelSelector } from "common/IModelSelector/IModelSelector";
import { ActiveSample } from "./ActiveSample";
import { SplitScreen } from "@bentley/monaco-editor/lib/components/split-screen/SplitScreen";
import Pane from "@bentley/monaco-editor/lib/components/split-screen/Pane";
import { Button, ButtonSize, ButtonType } from "@bentley/ui-core/lib/ui-core/button/Button";
import { Spinner, SpinnerSize } from "@bentley/ui-core/lib/ui-core/loading/Spinner";
import { ErrorBoundary } from "Components/ErrorBoundary/ErrorBoundary";
import "./SampleShowcase.scss";
import "common/samples-common.scss";

const Editor = React.lazy(async () => import(/* webpackMode: "lazy" */ "../SampleEditor/SampleEditorContext"));
const Visualizer = React.lazy(async () => import(/* webpackMode: "lazy" */ "../SampleVisualizer/SampleVisualizer"));

export const SampleShowcase: FunctionComponent = () => {
  const [activeSample, setActiveSample] = useState(() => new ActiveSample());
  const [scrollTo, setScrollTo] = useState(true);
  const [showEditor, setShowEditor] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [transpileResult, setTranspileResult] = useState<string>();
  const [dragging, setDragging] = useState(false);

  const showcaseRef = React.createRef<HTMLDivElement>();
  const galleryRef = React.createRef<SampleGallery>();

  useEffect(() => {
    if (scrollTo && galleryRef.current) {
      galleryRef.current.scrollToActiveSample();
      setScrollTo(false);
    }
  }, [scrollTo, galleryRef]);

  const editorSize = showEditor ? "400px" : "0";
  const gallerySize = showGallery ? "200px" : "0";

  const galleryClassName = dragging ? "gallery-pane dragging" : "gallery-pane";
  const editorClassName = dragging ? "editor-pane dragging" : "editor-pane";

  const onGalleryCardClicked = (groupName: string, sampleName: string, wantScroll: boolean) => {
    if (transpileResult && !window.confirm("Changes made to the code will not be saved!")) {
      return;
    }
    setScrollTo(wantScroll);
    setActiveSample(new ActiveSample(groupName, sampleName));
    setTranspileResult(undefined);
  };

  const onSampleGallerySizeChange = (size: number) => {
    if (size < 200 && showGallery) {
      setShowGallery(false);
    } else if (size >= 200 && !showGallery) {
      setShowGallery(true);
    }
  };

  const onEditorSizeChange = (size: number) => {
    if (size < 400 && showEditor) {
      setShowEditor(false);
    } else if (size >= 400 && !showGallery) {
      setShowEditor(true);
    }
  };

  const getImodelSelector = useCallback(() => {
    if (!activeSample.imodelList || !activeSample.imodelList.length)
      return undefined;

    return (
      <div className="model-selector">
        <IModelSelector
          iModelNames={activeSample.imodelList}
          iModelName={activeSample.imodel}
          onIModelChange={(imodelName) => setActiveSample(new ActiveSample(activeSample.group, activeSample.name, imodelName))} />
      </div>);
  }, [activeSample]);

  const spinner = (<div className="uicore-fill-centered" ><Spinner size={SpinnerSize.XLarge} /></div>);

  return (
    <div className="showcase" ref={showcaseRef}>
      <SplitScreen split="vertical" onResizeStart={() => setDragging(true)} onResizeEnd={() => setDragging(true)}>
        <Pane className={editorClassName} snapSize="400px" size={editorSize} onChange={onEditorSizeChange} disabled={!showEditor}>
          <React.Suspense fallback={spinner}>
            <Editor
              files={activeSample.getFiles}
              style={{ minWidth: "400px" }}
              onCloseClick={() => setShowEditor(!showEditor)}
              onSampleClicked={onGalleryCardClicked}
              onTranspiled={(blob) => setTranspileResult(blob)}
              readme={activeSample.getReadme} />
          </React.Suspense>
        </Pane>
        <Pane className="preview" minSize="500px">
          {!showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-code-button" onClick={() => setShowEditor(!showEditor)}><span className="icon icon-chevron-right"></span></Button>}
          {showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-code-button" onClick={() => setShowEditor(!showEditor)}><span className="icon icon-chevron-left"></span></Button>}
          <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
            <React.Suspense fallback={spinner}>
              <ErrorBoundary>
                <Visualizer
                  iModelName={activeSample.imodel}
                  iModelSelector={getImodelSelector()}
                  transpileResult={transpileResult}
                  type={activeSample.type} />
              </ErrorBoundary>
            </React.Suspense>
          </div>
          {!showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-gallery-button" onClick={() => setShowGallery(!showGallery)}><span className="icon icon-chevron-left"></span></Button>}
          {showGallery && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-gallery-button" onClick={() => setShowGallery(!showGallery)}><span className="icon icon-chevron-right"></span></Button>}
        </Pane>
        <Pane className={galleryClassName} snapSize="200px" size={gallerySize} maxSize="20%" onChange={onSampleGallerySizeChange} disabled={!showGallery}>
          <SampleGallery
            group={activeSample.group}
            style={{ minWidth: "200px" }}
            onChange={onGalleryCardClicked}
            ref={galleryRef}
            samples={sampleManifest}
            selected={activeSample.name} />
        </Pane>
      </SplitScreen>
    </div>
  );
};
