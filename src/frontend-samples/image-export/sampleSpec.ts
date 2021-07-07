/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getImageExportSpec(): SampleSpec {
  return ({
    name: "image-export-sample",
    label: "Image Export",
    image: "image-export-thumbnail.png",
    description: "Exports visible viewport of iModel as PNG image. #ImageExport",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./ImageExportApi"),
      import("!editor-file-loader!./ImageExportApp?entry=true"),
      import("!editor-file-loader!./ImageExportWidget"),
      import("!editor-file-loader!./ImageExport.scss"),
    ],
    iTwinViewerReady: true,
    type: "ImageExportApp.tsx",
  });
}
