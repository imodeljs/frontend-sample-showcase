/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import ImageExportUI from "./ImageExportUI";

export function getImageExportSpec(): SampleMetadata {
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
