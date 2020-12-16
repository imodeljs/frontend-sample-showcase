/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleIModels } from "Components/IModelSelector/IModelSelector";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import FireDecorationApp from "./FireDecorationApp";

export function getFireDecorationSpec(): SampleSpec {
  return ({
    name: "fire-decoration-sample",
    label: "Fire Decoration",
    image: "view-attributes-thumbnail.png",
    customModelList: [SampleIModels.RetailBuilding],
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "FireDecorationApp.tsx", import: import("!!raw-loader!./FireDecorationApp"), entry: true },
      { name: "FireDecorationUI.tsx", import: import("!!raw-loader!./FireDecorationUI") },
    ],
    setup: FireDecorationApp.setup.bind(FireDecorationApp),
  });
}
