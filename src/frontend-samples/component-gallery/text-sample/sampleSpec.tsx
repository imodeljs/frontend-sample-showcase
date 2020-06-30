/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import TextList from ".";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getTextSpec(): SampleSpec {
  return ({
    name: "text-sample",
    label: "UI-Text",
    image: "ui-text-thumbnail.png",
    customModelList: [],
    files: [
      { name: "TextListSample.tsx", import: import("!!raw-loader!./index"), entry: true },
    ],
    setup: TextList.setup,
  });
}
