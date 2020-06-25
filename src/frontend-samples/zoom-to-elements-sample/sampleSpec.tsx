/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { ZoomToElementsUI } from ".";

export function getZoomToElementsSpec(): SampleSpec {
  return ({
    name: "zoom-to-elements-sample",
    label: "Zoom to Elements",
    image: "zoom-to-elements-thumbnail.png",
    files: [
      { name: "ZoomToElementsSample.tsx", import: import("!!raw-loader!./index") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    setup: async (iModelName: string, iModelSelector: React.ReactNode) => {
      return <ZoomToElementsUI iModelName={iModelName} iModelSelector={iModelSelector} />;
    },
  });
}
