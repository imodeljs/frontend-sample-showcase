/*---------------------------------------------------------------------------------------------
|  $Copyright: (c) 2020 Bentley Systems, Incorporated. All rights reserved. $
 *--------------------------------------------------------------------------------------------*/

import * as React from "react";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ViewClipUI } from ".";

export function getViewClipSpec(): SampleSpec {
  return ({
    name: "view-clip-sample",
    label: "View Clipping",
    image: "view-clip-thumbnail.png",
    files: [
      { name: "index.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
    ],
    setup: async (imodel: IModelConnection) => {
      return <ViewClipUI imodel={imodel} />;
    },
  });
}