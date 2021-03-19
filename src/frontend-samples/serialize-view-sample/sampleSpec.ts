/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "@itwinjs-sandbox";
import { SampleSpec } from "SampleSpec";

export function getSerializeViewSpec(): SampleSpec {
  return {
    name: "serialize-view-sample",
    label: "Serialize View",
    image: "serialize-view-thumbnail.png",
    modelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "SerializeViewApp.tsx", import: import("!!raw-loader!./SerializeViewApp") },
      { name: "SerializeViewUI.tsx", import: import("!!raw-loader!./SerializeViewUI"), entry: true },
      { name: "SampleViewStates.ts", import: import("!!raw-loader!./SampleViewStates") },
    ],
    type: "SerializeViewUI.tsx",
  };
}
