/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import React from "react";
import { ViewerOnly2dUI } from ".";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "2d",
    image: "viewer-only-2d-thumbnail.png",
    files: [
      { name: "ViewerOnly2dSample.tsx", import: import("!!raw-loader!./index") },
      { name: "ViewCreator2d.tsx", import: import("!!raw-loader!./ViewCreator2d") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    customModelList: [SampleIModels.House],
    setup: async (iModelName: string) => {
      return <ViewerOnly2dUI iModelName={iModelName} />;
    },
  });
}
