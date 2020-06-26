/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import React from "react";
import { ViewAttributesUI } from ".";

export function getViewAttributesSpec(): SampleSpec {
  return ({
    name: "view-attributes-sample",
    label: "View Attributes",
    image: "view-attributes-thumbnail.png",
    files: [
      { name: "ViewAttributesSample.tsx", import: import("!!raw-loader!./index") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    setup: async (iModelName: string, iModelSelector: React.ReactNode) => {
      return <ViewAttributesUI iModelName={iModelName} iModelSelector={iModelSelector} />;
    },
  });
}
