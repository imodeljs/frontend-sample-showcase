import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import { IModelConnection, Viewport } from "@bentley/imodeljs-frontend";
import React from "react";
import { ViewportOnlyUI } from ".";

export function getViewportOnlySpec(): SampleSpec {
  return ({
    name: "viewport-only-sample",
    label: "Viewport Only",
    image: "viewport-only-thumbnail.png",
    files: [
      { name: "ViewportOnlySample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    modelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House],
    setup: async (imodel: IModelConnection, vp: Viewport) => { return <ViewportOnlyUI iModel={imodel} vp={vp} /> },
  });
}