/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getSerializeViewSpec(): SampleSpec {
  return {
    name: "serialize-view-sample",
    label: "Serialize View",
    image: "serialize-view-thumbnail.png",
    iModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./SerializeViewApi"),
      import("!editor-file-loader!./SerializeViewApp?entry=true"),
      import("!editor-file-loader!./SerializeViewWidget"),
      import("!editor-file-loader!./JsonViewerWidget"),
      import("!editor-file-loader!./SampleViewStates"),
      import("!editor-file-loader!./SerializeView.scss"),
    ],
    type: "SerializeViewApp.tsx",
    description: "How to #serialize, #deserialize and load a #viewstate from JSON.",
  };
}
