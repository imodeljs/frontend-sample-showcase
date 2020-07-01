/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { IModelApp } from "@bentley/imodeljs-frontend";
import ShadowStudyUI from "./ShadowStudyUI";

export default class ShadowStudyApp {

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ShadowStudyUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  // Updates the sun time for the current model
  public static updateSunTime(time: number) {
    const vp = IModelApp.viewManager.selectedView;

    if (vp && vp.view.is3d()) {
      const displayStyle = vp.view.getDisplayStyle3d();
      displayStyle.setSunTime(time);
      vp.displayStyle = displayStyle;
      vp.synchWithView();
    }
  }
}
