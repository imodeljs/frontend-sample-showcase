/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { IModelApp } from "@bentley/imodeljs-frontend";

export default class ImageExportApp {

  // Capture image of currently active viewport and trigger browser's download action.
  public static exportImage() {
    const viewPort = IModelApp.viewManager.getFirstOpenView();
    if (viewPort !== undefined) {
      const canvas = viewPort.readImageToCanvas();
      const imageUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.setAttribute("download", "viewport.png");
      link.setAttribute("href", imageUrl);
      link.click();
    }
  }

}
