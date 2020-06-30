/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import ThematicDisplaySampleApp from "./ThematicDisplayApp";

export function getThematicDisplaySpec(): SampleSpec {
  return ({
    name: "thematic-display-sample",
    label: "Thematic Display",
    image: "thematic-display-thumbnail.png",
    files: [
      { name: "ThematicDisplayApp.tsx", import: import("!!raw-loader!./ThematicDisplayApp") },
      { name: "ThematicDisplayUI.tsx", import: import("!!raw-loader!./ThematicDisplayUI") },
      { name: "ThematicDisplayAPI.ts", import: import("!!raw-loader!./ThematicDisplayAPI") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    setup: ThematicDisplaySampleApp.setup,
    teardown: ThematicDisplaySampleApp.teardown,
  });
}
