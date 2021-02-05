/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "Components/IModelSelector/IModelSelector";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ExplodeApp from "./ExplodeApp";

export function getExplodeSpec(): SampleSpec {
  return ({
    name: "explode-sample",
    label: "Exploded View",
    image: "exploded-view-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    customModelList: [SampleIModels.House],
    files: [
      { name: "ExplodeApp.tsx", import: import("!!raw-loader!./ExplodeApp"), entry: true },
      { name: "ExplodeUI.tsx", import: import("!!raw-loader!./ExplodeUI") },
      { name: "ExplodeTile.ts", import: import("!!raw-loader!./ExplodeTile") },
    ],
    setup: ExplodeApp.setup.bind(ExplodeApp),
  });
}
