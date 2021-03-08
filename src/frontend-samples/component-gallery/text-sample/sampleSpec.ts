/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";
import TextList from "./Text";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getTextSpec(): SampleSpec {
  return ({
    name: "text-sample",
    label: "UI-Text",
    image: "ui-text-thumbnail.png",
    customModelList: [],
    readme: () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "Text.tsx", import: import("!!raw-loader!./Text"), entry: true },
    ],
    sampleClass: TextList,
    type: "TextList",
  });
}
