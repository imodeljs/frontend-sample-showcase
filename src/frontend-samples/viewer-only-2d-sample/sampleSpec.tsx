import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { IModelConnection, } from "@bentley/imodeljs-frontend";
import React from "react";
import { ViewerOnly2dUI } from ".";
import * as React from "react";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "Viewer Only 2d",
    image: "viewer-only-2d-thumbnail.png",
    files: [
      { name: "ViewerOnly2dSample.tsx", import: import("!!raw-loader!./index") },
      { name: "ViewCreator2d.tsx", import: import("!!raw-loader!./ViewCreator2d") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    setup: async (imodel: IModelConnection) => {
      return <ViewerOnly2dUI imodel={imodel} />;
    },
  });
}