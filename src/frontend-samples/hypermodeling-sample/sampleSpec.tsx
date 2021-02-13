/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import HyperModelingApp from "./HyperModelingApp";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";

export function getHyperModelingSpec(): SampleSpec {
  return ({
    name: "hypermodeling-sample",
    label: "Hyper-modeling",
    image: "hypermodeling-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "HyperModelingApp.tsx", import: import("!!raw-loader!./HyperModelingApp"), entry: true },
      { name: "HyperModelingUI.tsx", import: import("!!raw-loader!./HyperModelingUI") },
    ],
    customModelList: [SampleIModels.House],
    setup: HyperModelingApp.setup.bind(HyperModelingApp),
    teardown: HyperModelingApp.teardown.bind(HyperModelingApp),
  });
}

