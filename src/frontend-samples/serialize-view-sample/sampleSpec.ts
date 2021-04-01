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
      { name: "SerializeViewApp.tsx", import: import("!!raw-loader!./SerializeViewApp") },
      { name: "SerializeViewUI.tsx", import: import("!!raw-loader!./SerializeViewUI"), entry: true },
      { name: "SerializeViewWidget.tsx", import: import("!!raw-loader!./SerializeViewWidget") },
      { name: "SampleViewStates.ts", import: import("!!raw-loader!./SampleViewStates") },
    ],
    iTwinViewerReady: true,
    type: "SerializeViewUI.tsx",
  };
}
