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
    image: "zoom-to-elements-thumbnail.png",
    customModelList: [SampleIModels.BayTown, SampleIModels.RetailBuilding],
    files: [
      { name: "PropertyFormattingApp.tsx", import: import("!!raw-loader!./PropertyFormattingApp"), entry: true },
      { name: "PropertyFormattingUI.tsx", import: import("!!raw-loader!./PropertyFormattingUI") },
    ],
    setup: PropertyFormattingApp.setup,
    teardown: PropertyFormattingApp.teardown,
  });
}
