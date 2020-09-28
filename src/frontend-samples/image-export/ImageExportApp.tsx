/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import ImageExportUI from "./ImageExportUI"
import { IModelApp } from "@bentley/imodeljs-frontend";

export default class ImageExportApp implements SampleApp {

  // Capture image of currently active viewport and trigger browser's download action.
  public static exportImage() {
    const viewPort = IModelApp.viewManager.getFirstOpenView();
    if (viewPort !== undefined) {
      const canvas = viewPort.readImageToCanvas();
      const imageUrl = canvas!.toDataURL("image/png");
      const link = document.createElement("a");
      link.setAttribute("download", "viewport.png")
      link.setAttribute('href', imageUrl);
      link.click();
    }
  }

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ImageExportUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }
}
