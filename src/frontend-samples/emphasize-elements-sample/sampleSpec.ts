/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import EmphasizeElementsApp from "./EmphasizeElementsApp";

export function getEmphasizeElementsSpec(): SampleSpec {
  return ({
    name: "emphasize-elements-sample",
    label: "Emphasize Elements",
    image: "emphasize-elements-thumbnail.png",
    files: [
      { name: "EmphasizeElementsApp.tsx", import: import("!!raw-loader!./EmphasizeElementsApp"), entry: true },
      { name: "EmphasizeElementsUI.tsx", import: import("!!raw-loader!./EmphasizeElementsUI") },

    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    setup: EmphasizeElementsApp.setup,
    teardown: EmphasizeElementsApp.teardown,
  });
}
