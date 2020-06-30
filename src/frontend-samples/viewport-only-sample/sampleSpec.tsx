/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React from "react";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ViewportOnlyUI from ".";

export function getViewportOnlySpec(): SampleSpec {
  return ({
    name: "viewport-only-sample",
    label: "3d",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "ViewportOnlySample.tsx", import: import("!!raw-loader!./index"), entry: true },
    ],
    setup: async (iModelName: string, iModelSelector: React.ReactNode) => <ViewportOnlyUI iModelName={iModelName} iModelSelector={iModelSelector} />,
  });
}
