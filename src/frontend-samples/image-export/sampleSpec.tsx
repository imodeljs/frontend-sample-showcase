/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ImageExportApp from "./ImageExportApp";

export function getImageExportSpec(): SampleSpec {
  return ({
    name: "image-export-sample",
    label: "Image Export",
    image: "image-export-thumbnail.png",
    files: [
      { name: "ImageExportApp.tsx", import: import("!!raw-loader!./ImageExportApp"), entry: true },
      { name: "ImageExportUI.tsx", import: import("!!raw-loader!./ImageExportUI") },
    ],
    setup: ImageExportApp.setup.bind(ImageExportApp),
  });
}
