/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import TextList from "./Text";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getTextSpec(): SampleSpec {
  return ({
    name: "text-sample",
    label: "UI-Text",
    image: "ui-text-thumbnail.png",
    customModelList: [],
    files: [
      { name: "Text.tsx", import: import("!!raw-loader!./Text") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: TextList.setup,
  });
}
