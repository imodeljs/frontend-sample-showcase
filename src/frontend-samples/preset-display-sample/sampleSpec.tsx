/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import PresetDisplayApp from "./PresetDisplayApp";

export function getPresetDisplaySpec(): SampleSpec {
  return ({
    name: "preset-display-sample",
    label: "Preset Display",
    image: "viewport-only-thumbnail.png",
    // image: "preset-display-thumbnail.png",
    files: [
      { name: "PresetDisplayApp.tsx", import: import("!!raw-loader!./PresetDisplayApp"), entry: true },
      { name: "PresetDisplayUI.tsx", import: import("!!raw-loader!./PresetDisplayUI") },
    ],
    setup: PresetDisplayApp.setup,
  });
}
