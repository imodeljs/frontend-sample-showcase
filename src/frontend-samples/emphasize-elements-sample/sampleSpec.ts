/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getEmphasizeElementsSpec(): SampleSpec {
  return ({
    name: "emphasize-elements-sample",
    label: "Emphasize Elements",
    image: "emphasize-elements-thumbnail.png",
    readme: async () => import("-!raw-loader!./readme.md"),
    files: () => [
      { name: "EmphasizeElementsApi.tsx", import: import("-!raw-loader!./EmphasizeElementsApi") },
      { name: "EmphasizeElementsApp.tsx", import: import("-!raw-loader!./EmphasizeElementsApp"), entry: true },
      { name: "EmphasizeElementsWidget.tsx", import: import("-!raw-loader!./EmphasizeElementsWidget") },
      { name: "EmphasizeElements.scss", import: import("-!raw-loader!./EmphasizeElements.scss") },
    ],
    iTwinViewerReady: true,
    iModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    type: "EmphasizeElementsApp.tsx",
  });
}
