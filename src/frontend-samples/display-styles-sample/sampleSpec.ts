/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import DisplayStylesUI from "./DisplayStylesUI";
import { SampleIModels } from "common/IModelSelector/IModelSelector";

export function getDisplayStylesSpec(): SampleSpec {
  return ({
    name: "display-styles-sample",
    label: "Display Styles",
    image: "display-styles-thumbnail.png",
    customModelList: [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "DisplayStylesApp.tsx", import: import("!!raw-loader!./DisplayStylesApp") },
      { name: "DisplayStylesUI.tsx", import: import("!!raw-loader!./DisplayStylesUI"), entry: true },
      { name: "Styles.ts", import: import("!!raw-loader!./Styles") },
    ],
    sampleClass: DisplayStylesUI,
  });
}
