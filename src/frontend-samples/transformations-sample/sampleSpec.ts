/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox";
import { SampleSpec } from "SampleSpec";

export function getTransformationSpec(): SampleSpec {
  return ({
    name: "transformations-sample",
    label: "Transformations",
    image: "transformation-thumbnail.png",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./TransformationsClient"),
      import("!editor-file-loader!./TransformationsApi"),
      import("!editor-file-loader!./TransformationsApp?entry=true"),
      import("!editor-file-loader!./TransformationsWidget"),
      import("!editor-file-loader!./TransformationsFrontstageProvider"),
      import("!editor-file-loader!./TwoWayViewportSync"),
      import("!editor-file-loader!./transformations-sample.scss"),
    ],
    iModelList: [SampleIModels.Stadium, SampleIModels.TransformedStadium],
    type: "TransformationsApp.tsx",
    description: "How use the #Transformations #API to transform an iModel into another, and display them.",
  });
}
