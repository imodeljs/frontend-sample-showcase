/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ViewAttributesUI from "./ViewAttributesUI";

export function getViewAttributesSpec(): SampleSpec {
  return ({
    name: "view-attributes-sample",
    label: "View Attributes",
    image: "view-attributes-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ViewAttributesUI.tsx", import: import("!!raw-loader!./ViewAttributesUI"), entry: true },
      { name: "ViewAttributesApp.tsx", import: import("!!raw-loader!./ViewAttributesApp") },
    ],
    sampleClass: ViewAttributesUI,
  });
}
