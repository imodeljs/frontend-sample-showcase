/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { IModelApp, IModelConnection, ViewCreator2d } from "@bentley/imodeljs-frontend";
import { ModelProps } from "@bentley/imodeljs-common";

export default class ViewerOnly2dApp {

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
    const vp = IModelApp.viewManager.selectedView!;
    const targetView = await ViewerOnly2dApp.createViewState(imodel, newModel);
    if (vp && targetView)
      vp.changeView(targetView);
    else
      alert("Invalid View Detected!");
  }

  public static async createViewState(imodel: IModelConnection, newModel: ModelProps) {
    const viewCreator = new ViewCreator2d(imodel);
    return viewCreator.createViewForModel(newModel.id!, newModel.classFullName);
  }
}
