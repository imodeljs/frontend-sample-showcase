/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import React from "react";
import ViewAttributesUI from "./ViewAttributesUI";

export function getViewAttributesSpec(): SampleSpec {
  return ({
    name: "view-attributes-sample",
    label: "View Attributes",
    image: "view-attributes-thumbnail.png",
    files: [
      { name: "ViewAttributesApp.ts", import: import("!!raw-loader!./ViewAttributesApp"), entry: true },
      { name: "ViewAttributesUI.tsx", import: import("!!raw-loader!./ViewAttributesUI") },
    ],
    setup: async (iModelName: string, iModelSelector: React.ReactNode) => {
      return <ViewAttributesUI iModelName={iModelName} iModelSelector={iModelSelector} />;
    },
  });
}
