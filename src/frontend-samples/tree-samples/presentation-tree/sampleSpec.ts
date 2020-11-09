/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import PresentationTreeApp from "./PresentationTreeApp";

export function getPresentationTreeSpec(): SampleSpec {
  return ({
    name: "presetation-tree-sample",
    label: "Presentation Tree",
    image: "presentation-tree-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "PresentationTreeApp.tsx", import: import("!!raw-loader!./PresentationTreeApp"), entry: true },
      { name: "PresentationTreeUI.tsx", import: import("!!raw-loader!./PresentationTreeUI"), entry: true },
    ],
    setup: PresentationTreeApp.setup.bind(PresentationTreeApp),
  });
}
