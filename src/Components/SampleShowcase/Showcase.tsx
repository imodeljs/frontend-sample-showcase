import React, { FunctionComponent, useEffect, useState } from 'react';
import { SampleGallery } from 'Components/SampleGallery/SampleGallery';
import { sampleManifest } from "../../sampleManifest";
import { IModelSelector } from 'common/IModelSelector/IModelSelector';
import { ActiveSample } from './ActiveSample';
import { SplitScreen } from '@bentley/monaco-editor/lib/components/split-screen/SplitScreen';
import Pane from '@bentley/monaco-editor/lib/components/split-screen/Pane';
import { Button, ButtonSize, ButtonType } from '@bentley/ui-core/lib/ui-core/button/Button';
import { ErrorBoundary } from 'Components/ErrorBoundary/ErrorBoundary';
import "./SampleShowcase.scss";
import "common/samples-common.scss";

const Editor = React.lazy(() => import(/* webpackMode: "lazy" */ "./../SampleEditor/SampleEditorContext"));
const Visualizer = React.lazy(() => import(/* webpackMode: "lazy" */ "./../SampleVisualizer/SampleVisualizer"));

type DragState = {
  dragging: boolean,
  paneSizes: string[]
}

const calculateMinSize = (containerSize: number, sizeStr: string = "0") => {
  const tokens = sizeStr.match(/([0-9]+)([px|%]*)/)!;
  const value = parseInt(tokens[1], 10);
  return +(containerSize * value / 100).toFixed(2);
}

export const Showcase: FunctionComponent = () => {

  const params = new URLSearchParams(window.location.search);
  const [activeSample, setActiveSample] = useState(new ActiveSample(params.get("group"), params.get("sample"), params.get("imodel")));
  const [scrollTo, setScrollTo] = useState(true);
  const [showEditor, setShowEditor] = useState(true);
  const [showGallery, setShowGallery] = useState(true);
  const [transpileResult, setTranspileResult] = useState<string>();
  const [dragState, setDragState] = useState<DragState>({ dragging: false, paneSizes: ["20%", "1", "20%"] });

  const showcaseRef = React.createRef<HTMLDivElement>();
  const galleryRef = React.createRef<SampleGallery>();

  useEffect(() => {
    if (scrollTo && galleryRef.current) {
      galleryRef.current.scrollToActiveSample();
      setScrollTo(false);
    }
  });

  const editorSize = !dragState.dragging && !showEditor ? "0%" : dragState.paneSizes[0];
  const gallerySize = !dragState.dragging && !showGallery ? "0%" : dragState.paneSizes[2];

  const width = showcaseRef.current?.getBoundingClientRect().width;
  const editorMinSize = !!width && !dragState.dragging ? calculateMinSize(width, dragState.paneSizes[0]) : undefined;
  const galleryMinSize = !!width && !dragState.dragging ? calculateMinSize(width, dragState.paneSizes[2]) : undefined;

  const galleryClassName = dragState.dragging ? "gallery-pane dragging" : "gallery-pane";
  const editorClassName = dragState.dragging ? "editor-pane dragging" : "editor-pane";

  const onGalleryCardClicked = (groupName: string, sampleName: string, wantScroll: boolean) => {
    setScrollTo(wantScroll);
    setActiveSample(new ActiveSample(groupName, sampleName));
  }

  const onSampleGallerySizeChange = (size: number) => {
    if (dragState.dragging) {
      size < 200 ? setShowGallery(false) : setShowGallery(true)
    }
  }
  const onEditorSizeChange = (size: number) => {
    if (dragState.dragging) {
      size < 200 ? setShowEditor(false) : setShowEditor(true)
    }
  }

  const getImodelSelector = () => {
    if (!activeSample.imodelList || !activeSample.imodelList.length)
      return undefined;

    return (
      <div className="model-selector">
        <IModelSelector
          iModelNames={activeSample.imodelList}
          iModelName={activeSample.imodel}
          onIModelChange={(imodelName) => setActiveSample(new ActiveSample(activeSample.group, activeSample.name, imodelName))} />
      </div>);
  }

  return (
    <div className="showcase" ref={showcaseRef}>
      <SplitScreen split="vertical" onResizeStart={() => setDragState({ ...dragState, dragging: true })} onResizeEnd={(sizes) => setDragState({ dragging: false, paneSizes: sizes })}>
        <Pane className={editorClassName} snapSize={"200px"} defaultSize={dragState.paneSizes[0]} size={editorSize} onChange={onEditorSizeChange} disabled={!showEditor}>
          <React.Suspense fallback="Suspense loading...">
            <Editor
              files={activeSample.getFiles}
              minSize={editorMinSize}
              onCloseClick={() => setShowEditor(!showEditor)}
              onSampleClicked={onGalleryCardClicked}
              onTranspiled={(blob) => setTranspileResult(blob)}
              readme={activeSample.getReadme} />
          </React.Suspense>
        </Pane>
        <Pane className="preview" minSize={"500px"}>
          {!showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="show-panel show-code-button" onClick={() => setShowEditor(!showEditor)}><span className="icon icon-chevron-right"></span></Button>}
          {showEditor && <Button size={ButtonSize.Large} buttonType={ButtonType.Blue} className="hide-panel hide-code-button" onClick={() => setShowEditor(!showEditor)}><span className="icon icon-chevron-left"></span></Button>}
          <div id="sample-container" className="sample-content" style={{ height: "100%" }}>
            <React.Suspense fallback="Suspense loading...">
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
        <Pane className={galleryClassName} snapSize={"200px"} size={gallerySize} maxSize={"20%"} defaultSize={dragState.paneSizes[2]} onChange={onSampleGallerySizeChange} disabled={!showGallery}>
          <SampleGallery
            group={activeSample.group}
            minSize={galleryMinSize}
            onChange={onGalleryCardClicked}
            ref={galleryRef}
            samples={sampleManifest}
            selected={activeSample.name} />
        </Pane>
      </SplitScreen>
    </div>
  )
}
