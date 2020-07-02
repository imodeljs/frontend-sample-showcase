/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import SliderList from "./Slider";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getSliderSpec(): SampleSpec {
  return ({
    name: "slider-sample",
    label: "UI-Sliders",
    image: "ui-sliders-thumbnail.png",
    customModelList: [],
    files: [
      { name: "Slider.tsx", import: import("!!raw-loader!./Slider"), entry: true },
    ],
    setup: SliderList.setup,
  });
}
