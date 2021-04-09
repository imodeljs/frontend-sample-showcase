/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp, IModelConnection, ViewCreator2d } from "@bentley/imodeljs-frontend";
import { ModelProps } from "@bentley/imodeljs-common";
import { ViewSetup } from "@itwinjs-sandbox";

export interface ModelLists {
  drawings: ModelProps[];
  sheets: ModelProps[];
}
export class ViewerOnly2dApi {

  public static async getInitial2DModel(imodel: IModelConnection, drawings?: ModelProps[], sheets?: ModelProps[]) {
    if (!drawings || !sheets) {
      const result = await ViewerOnly2dApi.get2DModels(imodel);
      drawings = result.drawings;
      sheets = result.sheets;
    }
    const selected = drawings[0] ? drawings[0] : sheets[0];
    return selected;
  }

  public static async get2DModels(imodel: IModelConnection): Promise<ModelLists> {
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
    const targetView = await ViewerOnly2dApi.createDefaultViewFor2dModel(imodel, newModel);
    if (vp && targetView)
      vp.changeView(targetView);
    else
      alert("Invalid View Detected!");
  }

  public static async createDefaultViewFor2dModel(imodel: IModelConnection, newModel: ModelProps) {
    const viewCreator = new ViewCreator2d(imodel);
    const vpAspect = ViewSetup.getAspectRatio();
    return viewCreator.createViewForModel(newModel.id!, newModel.classFullName, { vpAspect });
  }

}
