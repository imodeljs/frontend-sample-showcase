/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import SerializeViewUI from "./SerializeViewUI";
import { SampleIModels } from "common/IModelSelector/IModelSelector";

export function getSerializeViewSpec(): SampleSpec {
  return {
    name: "serialize-view-sample",
    label: "Serialize View",
    image: "serialize-view-thumbnail.png",
    customModelList: [SampleIModels.MetroStation, SampleIModels.RetailBuilding],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "SerializeViewUI.tsx", import: import("!!raw-loader!./SerializeViewUI"), entry: true },
      { name: "SerializeViewApp.tsx", import: import("!!raw-loader!./SerializeViewApp") },
      { name: "SampleViewStates.ts", import: import("!!raw-loader!./SampleViewStates") },
    ],
    sampleClass: SerializeViewUI,
  };
}
