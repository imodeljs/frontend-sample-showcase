/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "@itwinjs-sandbox";
import { SampleSpec } from "SampleSpec";
import HyperModelingUI from "./HyperModelingUI";

export function getHyperModelingSpec(): SampleSpec {
  return ({
    name: "hypermodeling-sample",
    label: "Hyper-modeling",
    image: "hypermodeling-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    iTwinViewerReady: true,
    files: [
      { name: "HyperModelingUI.tsx", import: import("!!raw-loader!./HyperModelingUI"), entry: true },
      { name: "HyperModelingApp.tsx", import: import("!!raw-loader!./HyperModelingApp") },
    ],
    modelList: [SampleIModels.House],
    sampleClass: HyperModelingUI,
  });
}

