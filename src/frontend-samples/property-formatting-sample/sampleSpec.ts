/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { PropertyFormattingApp } from "./PropertyFormattingApp";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";

export function getPropertyFormattingSpec(): SampleSpec {
  return ({
    name: "property-formatting-sample",
    label: "Property Formatting",
    image: "property-formatting-thumbnail.png",
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown],
    files: [
      { name: "PropertyFormattingApp.tsx", import: import("!!raw-loader!./PropertyFormattingApp"), entry: true },
      { name: "PropertyFormattingUI.tsx", import: import("!!raw-loader!./PropertyFormattingUI") },
      { name: "approach-1-UI.tsx", import: import("!!raw-loader!./approach-1-UI") },
      { name: "approach-2-UI.tsx", import: import("!!raw-loader!./approach-2-UI") },
      { name: "approach-3-UI.tsx", import: import("!!raw-loader!./approach-3-UI") },
    ],
    setup: PropertyFormattingApp.setup.bind(PropertyFormattingApp),
    teardown: PropertyFormattingApp.teardown.bind(PropertyFormattingApp),
  });
}
