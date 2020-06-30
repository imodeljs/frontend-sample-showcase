/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import LoadingList from ".";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getLoadingSpec(): SampleSpec {
  return ({
    name: "loading-sample",
    label: "UI-Loading Icons",
    image: "ui-loading-thumbnail.png",
    customModelList: [],
    files: [
      { name: "LoadingListSample.tsx", import: import("!!raw-loader!./index"), entry: true },
    ],
    setup: LoadingList.setup,
  });
}
