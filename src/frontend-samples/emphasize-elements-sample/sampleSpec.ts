/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "common/IModelSelector/IModelSelector";
import EmphasizeElementsUI from "./EmphasizeElementsUI";

export function getEmphasizeElementsSpec(): SampleSpec {
  return ({
    name: "emphasize-elements-sample",
    label: "Emphasize Elements",
    image: "emphasize-elements-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "EmphasizeElementsUI.tsx", import: import("!!raw-loader!./EmphasizeElementsUI"), entry: true },
      { name: "EmphasizeElementsApp.tsx", import: import("!!raw-loader!./EmphasizeElementsApp") },

    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    sampleClass: EmphasizeElementsUI
  });
}
