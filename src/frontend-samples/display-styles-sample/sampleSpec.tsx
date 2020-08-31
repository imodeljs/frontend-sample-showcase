/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import DisplayStylesApp from "./DisplayStylesApp";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";

export function getDisplayStylesSpec(): SampleSpec {
  return ({
    name: "display-styles-sample",
    label: "Display Styles",
    image: "display-styles-thumbnail.png",
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House, SampleIModels.Stadium],
    files: [
      { name: "DisplayStylesApp.tsx", import: import("!!raw-loader!./DisplayStylesApp"), entry: true },
      { name: "DisplayStylesUI.tsx", import: import("!!raw-loader!./DisplayStylesUI") },
      { name: "Styles.ts", import: import("!!raw-loader!./Styles") },
    ],
    setup: DisplayStylesApp.setup,
  });
}
