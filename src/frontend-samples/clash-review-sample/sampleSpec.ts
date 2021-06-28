/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getClashReviewSpec(): SampleSpec {
  return ({
    name: "clash-review-sample",
    label: "Clash Review",
    image: "clashreview.png",
    description: "Uses the #validation REST api to get and visualize #clash results.",
    readme: async () => import("!!raw-loader!./readme.md"),
    iTwinViewerReady: true,
    files: () => [
      import("!editor-file-loader!./ClashReviewApi"),
      import("!editor-file-loader!./ClashReviewApp.tsx?entry=true"),
      import("!editor-file-loader!./ClashDetectionApis.ts"),
      import("!editor-file-loader!./ClashReviewWidget.tsx"),
      import("!editor-file-loader!./ClashReviewTableWidget.tsx"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/MarkerPinDecorator.ts"),
      import("!editor-file-loader!frontend-samples/marker-pin-sample/PopupMenu.tsx"),
      import("!editor-file-loader!./ClashDetectionJsonData.ts"),
    ],
    iModelList: [SampleIModels.BayTown],
    type: "ClashReviewApp.tsx",
  });
}
