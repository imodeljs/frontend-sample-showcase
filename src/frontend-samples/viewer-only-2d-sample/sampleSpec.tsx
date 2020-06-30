/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import React from "react";

import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import ViewerOnly2dUI from "./ViewerOnly2dUI";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "2d",
    image: "viewer-only-2d-thumbnail.png",
    files: [
      { name: "ViewerOnly2dUI.tsx", import: import("!!raw-loader!./ViewerOnly2dUI") },
      { name: "ViewCreator2d.ts", import: import("!!raw-loader!./ViewCreator2d") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    customModelList: [SampleIModels.House],
    setup: async (iModelName: string, iModelSelector: React.ReactNode) => {
      return <ViewerOnly2dUI iModelName={iModelName} iModelSelector={iModelSelector} />;
    },
  });
}
