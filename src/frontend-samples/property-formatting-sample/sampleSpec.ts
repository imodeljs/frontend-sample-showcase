/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import { PropertyFormattingUI } from "./PropertyFormattingUI";
import { SampleIModels } from "@itwinjs-sandbox";

export function getPropertyFormattingSpec(): SampleSpec {
  return ({
    name: "property-formatting-sample",
    label: "Property Formatting",
    image: "property-formatting-thumbnail.png",
    modelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown],
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "PropertyFormattingApp.tsx", import: import("!!raw-loader!./PropertyFormattingApp") },
      { name: "PropertyFormattingUI.tsx", import: import("!!raw-loader!./PropertyFormattingUI"), entry: true },
      { name: "approach-1-UI.tsx", import: import("!!raw-loader!./approach-1-UI") },
      { name: "approach-2-UI.tsx", import: import("!!raw-loader!./approach-2-UI") },
      { name: "approach-3-UI.tsx", import: import("!!raw-loader!./approach-3-UI") },
    ],
    sampleClass: PropertyFormattingUI,
  });
}
