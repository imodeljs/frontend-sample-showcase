/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "common/IModelSelector/IModelSelector";
import { SampleSpec } from "SampleSpec";
import EmphasizeElementsUI from "./EmphasizeElementsUI";

export function getEmphasizeElementsSpec(): SampleSpec {
  return ({
    name: "emphasize-elements-sample",
    label: "Emphasize Elements",
    image: "emphasize-elements-thumbnail.png",
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "EmphasizeElementsUI.tsx", import: import("!!raw-loader!./EmphasizeElementsUI"), entry: true },
      { name: "EmphasizeElementsApp.tsx", import: import("!!raw-loader!./EmphasizeElementsApp") },

    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    sampleClass: EmphasizeElementsUI,
    type: "EmphasizeElementsUI",
  });
}
