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
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./HyperModelingApp?entry=true"),
      import("!editor-file-loader!./HyperModelingApi"),
      import("!editor-file-loader!./HyperModelingWidget"),
      import("!editor-file-loader!./HyperModeling.scss"),
    ],
    iModelList: [SampleIModels.House],
    type: "HyperModelingApp.tsx",
  });
}
