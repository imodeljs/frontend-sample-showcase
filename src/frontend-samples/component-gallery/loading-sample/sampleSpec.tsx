/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { LoadingList } from ".";

export function getLoadingSpec(): SampleSpec {
  return ({
    name: "loading-sample",
    label: "UI-Loading Icons",
    image: "ui-loading-thumbnail.png",
    customModelList: [],
    files: [
      { name: "LoadingListSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../../Components/GithubLink") },
      { name: "ComponentContainer.tsx", import: import("!!raw-loader!../CommonComponentTools/ComponentContainer") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../../common/samples-common.scss") },
      { name: "common-component-tools.scss", import: import("!!raw-loader!../CommonComponentTools/index.scss") },
    ],
    setup: LoadingList.setup,
  });
}
