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
    readme: () => import("!!raw-loader!./README.md"),
    files: () => [
      { name: "ImageExportUI.tsx", import: import("!!raw-loader!./ImageExportUI"), entry: true },
      { name: "ImageExportApp.tsx", import: import("!!raw-loader!./ImageExportApp") },
    ],
    type: "ImageExportUI.tsx",
  });
}
