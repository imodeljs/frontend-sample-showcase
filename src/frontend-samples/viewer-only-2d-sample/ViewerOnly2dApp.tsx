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
  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void) {
    return <ViewerOnly2dUI iModelName={iModelName} setupControlPane={setupControlPane} />;
  }

  public static async get2DModels(imodel: IModelConnection): Promise<{ drawings: ModelProps[], sheets: ModelProps[] }> {
    const models = await imodel.models.queryProps({ from: "BisCore.GeometricModel2d" });
    const drawingViews: ModelProps[] = [];
    const sheetViews: ModelProps[] = [];
    models.forEach((model: ModelProps) => {
      if (ViewCreator2d.isSheetModelClass(model.classFullName))
        sheetViews.push(model);
      else if (ViewCreator2d.isDrawingModelClass(model.classFullName))
        drawingViews.push(model);
    });
    return { drawings: drawingViews, sheets: sheetViews };
  }

  /** When a model is selected in above list, get its view and switch to it.  */
  public static async changeViewportView(imodel: IModelConnection, newModel: ModelProps) {
    const vp = IModelApp.viewManager.selectedView;
    const vpAspect = ViewSetup.getAspectRatio();

    if (vp && vpAspect) {
      const viewCreator = new ViewCreator2d(imodel);
      const targetView = await viewCreator.getViewForModel(newModel, vpAspect);
      if (targetView) vp.changeView(targetView);
      else alert("Invalid View Detected!");
    }
  }
}
