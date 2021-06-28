/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getViewerOnly2dSpec(): SampleSpec {
  return ({
    name: "viewer-only-2d-sample",
    label: "2d",
    image: "viewer-only-2d-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./ViewerOnly2dApi"),
      import("!editor-file-loader!./ViewerOnly2dApp?entry=true"),
      import("!editor-file-loader!./ViewerOnly2dWidget?entry=true"),
      import("!editor-file-loader!./ViewerOnly2d.scss"),
    ],
    iModelList: [SampleIModels.House, SampleIModels.MetroStation],
    type: "ViewerOnly2dApp.tsx",
  });
}
