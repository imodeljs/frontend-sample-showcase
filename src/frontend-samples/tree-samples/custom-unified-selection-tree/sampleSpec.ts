/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import CustomUnifiedSelectionTreeSample from "./CustomUnifiedSelectionTree";

export function getCustomUnifiedSelectionTreeSpec(): SampleSpec {
  return ({
    name: "custom-unified-selection-tree-sample",
    label: "Custom Unified Selection Tree",
    image: "custom-unified-selection-tree-thumbnail.png",
    files: [
      { name: "CustomUnifiedSelectionTreeSample.tsx", import: import("!!raw-loader!./CustomUnifiedSelectionTree"), entry: true },
    ],
    setup: CustomUnifiedSelectionTreeSample.setup,
  });
}
