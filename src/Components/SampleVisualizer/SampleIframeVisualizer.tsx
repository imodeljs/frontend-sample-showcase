/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { forwardRef } from "react";

export const SampleIframeVisualizer = forwardRef<HTMLIFrameElement, { hidden: boolean }>(({ hidden }, ref) => {

  return <div style={{ height: "100%", width: "100%", lineHeight: "initial", display: hidden ? "none" : undefined }}>
    <iframe style={{ height: "100%", width: "100%", border: "none" }} ref={ref} />
  </div>;
});

SampleIframeVisualizer.displayName = "SampleIframeVisualizer";

// export const SampleIframeLoading: FunctionComponent = () => {
//   return <
// }
