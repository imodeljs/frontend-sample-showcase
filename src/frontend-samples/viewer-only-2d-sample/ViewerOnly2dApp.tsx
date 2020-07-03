/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import ViewerOnly2dUI from "./ViewerOnly2dUI";
import { IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { ViewCreator2d } from "./ViewCreator2d";
import { ModelProps } from "@bentley/imodeljs-common";

export default class ViewerOnly2dApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ViewerOnly2dUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }
}

/** When a model is selected in above list, get its view and switch to it.  */
export const changeViewportView = async (index: number, imodel: IModelConnection, models: ModelProps[]) => {
  const vp = IModelApp.viewManager.selectedView;

  if (vp) {
    const vpAspect = vp.vpDiv.clientHeight / vp.vpDiv.clientWidth;
    const viewCreator = new ViewCreator2d(imodel!);
    const targetView = await viewCreator.getViewForModel(models![index], vpAspect);
    if (targetView) vp.changeView(targetView);
    else alert("Invalid View Detected!");
  }
};
