/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../../Components/SampleShowcase/SampleShowcase";
import SliderList from "./Slider";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getSliderSpec(): SampleMetadata {
  return ({
    name: "slider-sample",
    label: "UI-Sliders",
    image: "ui-sliders-thumbnail.png",
    modelList: [],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "Slider.tsx", import: import("!!raw-loader!./Slider"), entry: true },
    ],
    sampleClass: SliderList,
  });
}
