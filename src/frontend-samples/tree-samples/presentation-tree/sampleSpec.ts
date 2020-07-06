/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import PresentationTreeSample from "./PresentationTree";

export function getPresentationTreeSpec(): SampleSpec {
  return ({
    name: "presetation-tree-sample",
    label: "Presentation Tree",
    image: "presentation-tree-thumbnail.png",
    files: [
      { name: "PresentationTreeSample.tsx", import: import("!!raw-loader!./PresentationTree"), entry: true },
    ],
    setup: PresentationTreeSample.setup,
  });
}
