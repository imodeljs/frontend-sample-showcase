/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import { ViewClipUI } from ".";

export function getViewClipSpec(): SampleSpec {
  return ({
    name: "view-clip-sample",
    label: "View Clipping",
    image: "view-clip-thumbnail.png",
    files: [
      { name: "ViewClipSample.tsx", import: import("!!raw-loader!./index") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    customModelList: [SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.House],
    setup: async (iModelName: string, iModelSelector: React.ReactNode) => {
      return <ViewClipUI iModelName={iModelName} iModelSelector={iModelSelector} />;
    },
  });
}
