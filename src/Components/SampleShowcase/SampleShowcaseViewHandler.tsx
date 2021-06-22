/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { useResizeObserver } from "@bentley/ui-core/lib/ui-core/utils/hooks/useResizeObserver";
import React, { FunctionComponent, useCallback, useEffect, useRef, useState } from "react";
import { SampleShowcaseSplitPane } from "./SampleShowcaseSplitPane";
import "./SampleShowcaseViewHandler.scss";

export interface SampleShowcaseViewHandlerProps {
  editor: JSX.Element;
  visualizer: JSX.Element;
  gallery?: JSX.Element;
}

export const SampleShowcaseViewHandler: FunctionComponent<SampleShowcaseViewHandlerProps> = ({ editor, visualizer, gallery }) => {
  const showcaseRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(screen.width);

  const handleResize = useCallback((widthResult: number) => {
    setWidth(widthResult);
  }, []);

  const resizeObserver = useResizeObserver(handleResize);

  useEffect(() => {
    if (showcaseRef.current) {
      resizeObserver(showcaseRef.current);
    }
  }, [resizeObserver, showcaseRef]);

  return (
    <div className="showcase" ref={showcaseRef}>
      <SampleShowcaseSplitPane width={width} visualizer={visualizer} editor={editor} gallery={gallery} />
    </div>
  );
};
