/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getZoomToElementsSpec(): SampleSpec {
  return ({
    name: "zoom-to-elements-sample",
    label: "Zoom to Elements",
    image: "zoom-to-elements-thumbnail.png",
    description: "Uses #zoomToElement, #ZoomToOptions, and #ViewChangeOptions to center the view on element(s) of interest.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ZoomToElementsApi"),
      import("!editor-file-loader!./ZoomToElementsApp?entry=true"),
      import("!editor-file-loader!./ZoomToElementsWidget"),
      import("!editor-file-loader!./ZoomToElements.scss"),
    ],
    iModelList: [SampleIModels.BayTown, SampleIModels.RetailBuilding, SampleIModels.MetroStation, SampleIModels.House, SampleIModels.Stadium],
    type: "ZoomToElementsApp.tsx",
  });
}
