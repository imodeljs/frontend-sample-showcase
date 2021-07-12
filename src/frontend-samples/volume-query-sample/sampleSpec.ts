/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getVolumeQuerySpec(): SampleSpec {
  return ({
    name: "volume-query-sample",
    label: "Volume Query",
    image: "volume-query-thumbnail.png",
    description: "Query #SpatialElements using #SpatialQueries. Elements are classified using #getGeometryContainment. To color and represent elements #EmphasizeElements and #PresentationLabelsProvider are being used.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./VolumeQueryApi"),
      import("!editor-file-loader!./VolumeQueryApp?entry=true"),
      import("!editor-file-loader!./VolumeQueryWidget"),
      import("!editor-file-loader!./VolumeQuery.scss"),
    ],
    iModelList: [SampleIModels.RetailBuilding],
    type: "VolumeQueryApp.tsx",
  });
}
