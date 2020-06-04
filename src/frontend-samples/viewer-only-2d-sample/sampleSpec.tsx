import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import { IModelConnection, } from "@bentley/imodeljs-frontend";
import React from "react";
import { ViewerOnly2dUI } from ".";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "Viewer Only 2d",
    image: "viewer-only-2d-thumbnail.png",
    files: [
      { name: "index.tsx", import: import("!!raw-loader!./index") },
      { name: "ViewCreator2d.tsx", import: import("!!raw-loader!./ViewCreator2d") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    setup: async (imodel: IModelConnection) => {
      return <ViewerOnly2dUI imodel={imodel} />;
    },
  });
}