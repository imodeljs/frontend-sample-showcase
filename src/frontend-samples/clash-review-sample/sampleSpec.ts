/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getClashReviewSpec(): SampleSpec {
  return ({
    name: "clash-review-sample",
    label: "Clash Review",
    image: "clashreview.png",
    description: "Uses the #validation REST api to get and visualize #clash results.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ClashReviewApi"),
      import("!editor-file-loader!./ClashReviewApp?entry=true"),
      import("!editor-file-loader!./ClashDetectionClient"),
      import("!editor-file-loader!./ClashReviewWidget"),
      import("!editor-file-loader!./ClashReviewTableWidget"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/PopupMenu"),
      import("!editor-file-loader!./ClashDetectionJsonData"),
    ],
    iModelList: [SampleIModels.BayTown],
    type: "ClashReviewApp.tsx",
  });
}
