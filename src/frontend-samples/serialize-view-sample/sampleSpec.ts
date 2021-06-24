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
      { name: "SerializeViewApi.ts", import: import("!!raw-loader!./SerializeViewApi") },
      { name: "SerializeViewApp.tsx", import: import("!!raw-loader!./SerializeViewApp"), entry: true },
      { name: "SerializeViewWidget.tsx", import: import("!!raw-loader!./SerializeViewWidget") },
      { name: "JsonViewerWidget.tsx", import: import("!!raw-loader!./JsonViewerWidget") },
      { name: "SampleViewStates.ts", import: import("!!raw-loader!./SampleViewStates") },
      { name: "SerializeView.scss", import: import("!!raw-loader!./SerializeView.scss") },
    ],
    iTwinViewerReady: true,
    type: "SerializeViewApp.tsx",
    description: "How to #serialize, #deserialize and load a #viewstate from JSON.",
  };
}
