/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getHyperModelingSpec(): SampleSpec {
  return ({
    name: "hypermodeling-sample",
    label: "Hyper-modeling",
    image: "hypermodeling-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("-!raw-loader!./readme.md"),
    files: () => [
      { name: "HyperModelingApp.tsx", import: import("-!raw-loader!./HyperModelingApp"), entry: true },
      { name: "HyperModelingApi.tsx", import: import("-!raw-loader!./HyperModelingApi") },
      { name: "HyperModelingWidget.tsx", import: import("-!raw-loader!./HyperModelingWidget") },
      { name: "HyperModeling.scss", import: import("-!raw-loader!./HyperModeling.scss") },
    ],
    iModelList: [SampleIModels.House],
    type: "HyperModelingApp.tsx",
  });
}
