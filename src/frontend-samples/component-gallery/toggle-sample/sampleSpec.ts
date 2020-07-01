/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import ToggleList from "./Toggle";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getToggleSpec(): SampleSpec {
  return ({
    name: "toggle-sample",
    label: "UI-Toggles",
    image: "ui-toggle-thumbnail.png",
    customModelList: [],
    files: [
      { name: "Toggles.tsx", import: import("!!raw-loader!./Toggles"), entry: true },
    ],
    setup: ToggleList.setup,
  });
}
