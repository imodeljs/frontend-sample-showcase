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
import SampleApp from "common/SampleApp";
import { ViewSetup } from "api/viewSetup";

export default class ViewerOnly2dApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ViewerOnly2dUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static getDrawingModelList(models: ModelProps[]) {
    const drawingViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      if (ViewCreator2d.drawingModelClasses.includes(model.classFullName))
        drawingViews.push(<option key={index} value={index}>{model.name}</option>);
    });
    return drawingViews;
  }

  public static getSheetModelList(models: ModelProps[]) {
    const sheetViews: JSX.Element[] = [];
    models.forEach((model: ModelProps, index) => {
      if (ViewCreator2d.sheetModelClasses.includes(model.classFullName))
        sheetViews.push(<option key={index} value={index}>{model.name}</option>);
    });
    return sheetViews;
  }
}

/** When a model is selected in above list, get its view and switch to it.  */
export const changeViewportView = async (index: number, imodel: IModelConnection, models: ModelProps[]) => {
  const vp = IModelApp.viewManager.selectedView;

  if (vp) {
    const vpAspect = ViewSetup.getAspectRatio();
    const viewCreator = new ViewCreator2d(imodel!);
    const targetView = await viewCreator.getViewForModel(models![index], vpAspect);
    if (targetView) vp.changeView(targetView);
    else alert("Invalid View Detected!");
  }
};
