/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "SampleSpec";
import ImageExportUI from "./ImageExportUI";

export function getImageExportSpec(): SampleSpec {
  return ({
    name: "image-export-sample",
    label: "Image Export",
    image: "image-export-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      { name: "ImageExportApp.tsx", import: import("!!raw-loader!./ImageExportApp") },
      { name: "ImageExportUI.tsx", import: import("!!raw-loader!./ImageExportUI"), entry: true },
    ],
    sampleClass: ImageExportUI,
  });
}
