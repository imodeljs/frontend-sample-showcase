/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useState } from "react";
import { SampleShowcaseViewHandlerProps } from "./SampleShowcaseViewHandler";
import "./SampleShowcaseSplitPane.scss";
import { Button } from "@itwin/itwinui-react";
import { HandlerProps, ReflexContainer, ReflexElement, ReflexSplitter } from "react-reflex";

export interface SampleShowcaseSplitPaneProps extends SampleShowcaseViewHandlerProps {
  width: number;
}

interface Sizes {
  minEditorSize: number;
  minPreviewSize: number;
  maxGallerySize: number;
}

const calculateSizes = (width: number) => {
  if (width >= 1024) {
    return {
      minEditorSize: Math.floor(width * 0.25),
      minPreviewSize: 400,
      maxGallerySize: 250,
    };
  } else if (width < 1024 && width >= 768) {
    return {
      minEditorSize: Math.floor(width * 0.33),
      minPreviewSize: Math.floor(width * 0.33),
      maxGallerySize: Math.floor(width * 0.25),
    };
  } else if (width < 768 && width >= 576) {
    return {
      minEditorSize: Math.floor(width * 0.33),
      minPreviewSize: Math.floor(width * 0.33),
      maxGallerySize: Math.floor(width * 0.25),
    };
  } else {
    return {
      minEditorSize: width,
      minPreviewSize: width,
      maxGallerySize: width,
    };
  }
};

export const SampleShowcaseSplitPane: FunctionComponent<SampleShowcaseSplitPaneProps> = ({ width, editor, visualizer, gallery }) => {
  const [sizes, setSizes] = useState<Sizes>(calculateSizes(width));
  const [showEditor, setShowEditor] = useState(width >= 1024);
  const [showGallery, setShowGallery] = useState(width >= 576 && !!gallery);

  useEffect(() => {
    setSizes(calculateSizes(width));
  }, [width]);

  const editorClassName = ["editor-pane"];
  const galleryClassName = ["gallery-pane"];

  width < 576 && showEditor && editorClassName.push("mobile-visible");
  width < 576 && showGallery && galleryClassName.push("mobile-visible");
  !showEditor && editorClassName.push("hidden");
  !showGallery && galleryClassName.push("hidden");

  const onSampleGallerySizeChange = useCallback(({ domElement }: HandlerProps) => {

    if (width >= 576) {
      const minSize = 150;
      const size = Math.ceil((domElement as HTMLElement).offsetWidth);
      setShowGallery(size >= minSize || !showGallery);
    }
  }, [showGallery, width]);

  const onEditorSizeChange = useCallback(({ domElement }: HandlerProps) => {

    if (width >= 576) {
      const minSize = sizes.minEditorSize;
      const size = Math.ceil((domElement as HTMLElement).offsetWidth);
      setShowEditor(size >= minSize || !showEditor);
    }

  }, [showEditor, sizes.minEditorSize, width]);

  const onGalleryButtonClick = useCallback(() => {
    if (width < 1024 && !showGallery && showEditor) {
      setShowEditor(false);
    }
    setShowGallery(!showGallery);
  }, [showEditor, showGallery, width]);

  const onEditorButtonClick = useCallback(() => {
    if (width < 1024 && !showEditor && showGallery) {
      setShowGallery(false);
    }
    setShowEditor(!showEditor);
  }, [showEditor, showGallery, width]);

  return (
    <ReflexContainer orientation="vertical">
      <ReflexElement className={editorClassName.join(" ")} flex={!showEditor ? 0.0001 : undefined} onResize={onEditorSizeChange} direction={1}>
        {showEditor && editor}
      </ReflexElement>
      <ReflexSplitter propagate />
      <ReflexElement className={"preview"} minSize={sizes.minPreviewSize}>
        {((width < 576 && !showGallery) || width >= 576) && !showEditor && <Button style={{ position: "absolute" }} size={"large"} styleType={"high-visibility"} className="show-panel show-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-right"></span></Button>}
        {showEditor && <Button style={{ position: "absolute" }} size={"large"} styleType={"high-visibility"} className="hide-panel hide-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-left"></span></Button>}
        {visualizer}
        {gallery && ((width < 576 && !showEditor) || width >= 576) && !showGallery && <Button style={{ position: "absolute" }} size={"large"} styleType={"high-visibility"} className="show-panel show-gallery-button" onClick={onGalleryButtonClick}><span className="icon icon-chevron-left"></span></Button>}
        {gallery && showGallery && <Button style={{ position: "absolute" }} size={"large"} styleType={"high-visibility"} className="hide-panel hide-gallery-button" onClick={onGalleryButtonClick}><span className="icon icon-chevron-right"></span></Button>}
      </ReflexElement>
      {gallery && <ReflexSplitter />}
      {gallery && <ReflexElement className={galleryClassName.join(" ")} flex={!showGallery ? 0.0001 : undefined} maxSize={sizes.maxGallerySize} onResize={onSampleGallerySizeChange} direction={-1}>
        {showGallery && gallery}
      </ReflexElement>}
    </ReflexContainer >
  );
};
