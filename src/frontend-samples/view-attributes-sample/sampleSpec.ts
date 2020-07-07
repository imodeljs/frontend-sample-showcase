/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ViewAttributesApp from "./ViewAttributesApp";

export function getViewAttributesSpec(): SampleSpec {
  return ({
    name: "view-attributes-sample",
    label: "View Attributes",
    image: "view-attributes-thumbnail.png",
    files: [
      { name: "ViewAttributesApp.tsx", import: import("!!raw-loader!./ViewAttributesApp"), entry: true },
      { name: "ViewAttributesUI.tsx", import: import("!!raw-loader!./ViewAttributesUI") },
    ],
    setup: ViewAttributesApp.setup,
  });
}
