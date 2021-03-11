/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import SerializeViewUI from "./SerializeViewUI";
import { SampleIModels } from "@itwinjs-sandbox";

export function getSerializeViewSpec(): SampleMetadata {
  return {
    name: "serialize-view-sample",
    label: "Serialize View",
    image: "serialize-view-thumbnail.png",
    modelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "SerializeViewApp.tsx", import: import("!!raw-loader!./SerializeViewApp") },
      { name: "SerializeViewUI.tsx", import: import("!!raw-loader!./SerializeViewUI"), entry: true },
      { name: "SampleViewStates.ts", import: import("!!raw-loader!./SampleViewStates") },
    ],
    sampleClass: SerializeViewUI,
  };
}
