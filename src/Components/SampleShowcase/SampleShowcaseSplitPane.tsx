/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import { SplitScreen } from "@bentley/monaco-editor/lib/components/split-screen/SplitScreen";
import Pane from "@bentley/monaco-editor/lib/components/split-screen/Pane";
import { SampleShowcaseViewHandlerProps } from "./SampleShowcaseViewHandler";
import "./SampleShowcaseSplitPane.scss";
import { Button } from "@itwin/itwinui-react";

export interface SampleShowcaseSplitPaneProps extends SampleShowcaseViewHandlerProps {
  width: number;
}

interface Sizes {
  editorSize: number;
  gallerySize: number;
  minPreviewSize: number;
  maxGallerySize: number;
}

const calculateSizes = (width: number) => {
  if (width >= 1024) {
    return {
      editorSize: Math.floor(width * 0.33),
      gallerySize: 200,
      minPreviewSize: 400,
      maxGallerySize: 20,
    };
  } else if (width < 1024 && width >= 768) {
    return {
      editorSize: Math.floor(width * 0.5),
      gallerySize: Math.floor(width * 0.2),
      minPreviewSize: Math.floor(width * 0.33),
      maxGallerySize: 30,
    };
  } else if (width < 768 && width >= 576) {
    return {
      editorSize: Math.floor(width * 0.5),
      gallerySize: 150,
      minPreviewSize: Math.floor(width * 0.33),
      maxGallerySize: 30,
    };
  } else {
    return {
      editorSize: width,
      gallerySize: width,
      minPreviewSize: width,
      maxGallerySize: 100,
    };
  }
};

export const SampleShowcaseSplitPane: FunctionComponent<SampleShowcaseSplitPaneProps> = ({ width, editor, visualizer, gallery }) => {
  const [sizes, setSizes] = useState<Sizes>(calculateSizes(width));
  const [showEditor, setShowEditor] = useState(width >= 1024);
  const [showGallery, setShowGallery] = useState(width >= 576 && !!gallery);
  const [dragging, setDragging] = useState<boolean>(false);
  const ignoreEditorSize = useRef<boolean>(false);
  const ignoreGallerySize = useRef<boolean>(false);

  useEffect(() => {
    setSizes(calculateSizes(width));
  }, [width]);

  const editorClassName = ["editor-pane"];
  const galleryClassName = ["gallery-pane"];

  dragging && editorClassName.push("dragging");
  dragging && galleryClassName.push("dragging");

  width < 576 && showEditor && editorClassName.push("mobile-visible");
  width < 576 && showGallery && galleryClassName.push("mobile-visible");

  const onSampleGallerySizeChange = (size: number) => {
    if (!ignoreGallerySize.current) {
      if (width >= 576) {
        const minSize = sizes?.gallerySize || 200;
        size = Math.ceil(size);
        if (size < minSize && showGallery) {
          setShowGallery(false);
          ignoreGallerySize.current = true;
          document.dispatchEvent(new MouseEvent("mouseup"));
        } else if (size >= minSize && !showGallery) {
          setShowGallery(true);
          ignoreGallerySize.current = true;
        }
      }
    }
  };

  const onEditorSizeChange = (size: number) => {
    if (!ignoreEditorSize.current) {
      if (width >= 576) {
        const minSize = sizes?.editorSize || 412;
        size = Math.ceil(size);
        if (size < minSize && showEditor) {
          setShowEditor(false);
          ignoreEditorSize.current = true;
          document.dispatchEvent(new MouseEvent("mouseup"));
        } else if (size >= minSize && !showEditor) {
          setShowEditor(true);
          ignoreEditorSize.current = true;
        }
      }
    }
  };

  const onGalleryButtonClick = useCallback(() => {
    if (width < 1024 && !showGallery && showEditor) {
      setShowEditor(false);
    }
    setShowGallery(!showGallery);
  }, [showGallery, showEditor, width]);

  const onEditorButtonClick = useCallback(() => {
    if (width < 1024 && !showEditor && showGallery) {
      setShowGallery(false);
    }
    setShowEditor(!showEditor);
  }, [showEditor, showGallery, width]);

  if (!gallery)
    return (
      <SplitScreen split="vertical" onResizeStart={() => setDragging(true)} onResizeEnd={() => setDragging(false)}>
        <Pane className={editorClassName.join(" ")} disabled={!showEditor} size={showEditor ? `${sizes?.editorSize}px` : "0"} onChange={onEditorSizeChange}>
          {editor}
        </Pane>
        <Pane className={"preview"} minSize={`${sizes?.minPreviewSize}px`}>
          {((width < 576 && !showGallery) || width >= 576) && !showEditor && <Button size={"large"} styleType={"high-visibility"} className="show-panel show-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-right"></span></Button>}
          {showEditor && <Button size={"large"} styleType={"high-visibility"} className="hide-panel hide-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-left"></span></Button>}
          {visualizer}
        </Pane>
      </SplitScreen >
    );

  return (
    <SplitScreen split="vertical" onResizeStart={() => setDragging(true)} onResizeEnd={() => setDragging(false)}>
      <Pane className={editorClassName.join(" ")} disabled={!showEditor} size={showEditor ? `${sizes?.editorSize}px` : "0"} onChange={onEditorSizeChange}>
        {editor}
      </Pane>
      <Pane className={"preview"} minSize={`${sizes?.minPreviewSize}px`}>
        {((width < 576 && !showGallery) || width >= 576) && !showEditor && <Button style={{ position: "absolute" }} size={"large"} styleType={"high-visibility"} className="show-panel show-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-right"></span></Button>}
        {showEditor && <Button style={{ position: "absolute" }} size={"large"} styleType={"high-visibility"} className="hide-panel hide-code-button" onClick={onEditorButtonClick}><span className="icon icon-chevron-left"></span></Button>}
        {visualizer}
        {((width < 576 && !showEditor) || width >= 576) && !showGallery && <Button style={{ position: "absolute" }} size={"large"} styleType={"high-visibility"} className="show-panel show-gallery-button" onClick={onGalleryButtonClick}><span className="icon icon-chevron-left"></span></Button>}
        {showGallery && <Button style={{ position: "absolute" }} size={"large"} styleType={"high-visibility"} className="hide-panel hide-gallery-button" onClick={onGalleryButtonClick}><span className="icon icon-chevron-right"></span></Button>}
      </Pane>
      <Pane className={galleryClassName.join(" ")} maxSize={`${sizes?.maxGallerySize}%`} disabled={!showGallery} size={showGallery ? `${sizes?.gallerySize}px` : "0"} onChange={onSampleGallerySizeChange}>
        {gallery}
      </Pane>
    </SplitScreen >
  );
};
