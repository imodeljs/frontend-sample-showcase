import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { IModelConnection, Viewport } from "@bentley/imodeljs-frontend";
import React from "react";
import { ZoomToElementsUI } from ".";

export function getZoomToElementsSpec(): SampleSpec {
  return ({
    name: "zoom-to-elements-sample",
    label: "Zoom to Elements",
    image: "zoom-to-elements-thumbnail.png",
    files: [
      { name: "ZoomToElementsSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
      { name: "index.scss", import: import("!!raw-loader!./index.scss") },
    ],
    setup: async (imodel: IModelConnection) => {
      return <ZoomToElementsUI imodel={imodel} />;
    },
  });
}