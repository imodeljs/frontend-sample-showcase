/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, IModelConnection, SelectionSetEvent, SelectionSetEventType, Viewport } from "@bentley/imodeljs-frontend";
import { ViewCreator2d } from "frontend-samples/cross-probing-sample/ViewCreator2d";
import { ColorDef } from "@bentley/imodeljs-common";

/** This sample showcases how to implement cross-probing between 3D and 2D elements.
 * At startup, it fetches all 2D/3D connections in the iModel and and maps them into an array.
 * When the user clicks on an element, this map is used to lookup any corresponding 2D/3D element.
 * If the target element is 2D, its model is opened.
 * The target element is then zoomed into.
 */

export default class CrossProbingApp {

  // keep track of last element selected (to avoid double clicks).
  private static lastElementSelected: string | undefined;
  // array to keep track of all 3D/2D connections.
  private static elementMap?: any[];

  // add listener to capture element selection events.
  public static addElementSelectionListener(imodel: IModelConnection) {
    imodel.selectionSet.onChanged.addListener(CrossProbingApp.elementSelected);
  }

  // this method is called when an element is selected on a viewport.
  private static elementSelected = async (ev: SelectionSetEvent) => {

    if (CrossProbingApp.elementMap === null) return;

    const sourceElementId = Array.from(ev.set.elements).pop();

    if (ev.type === SelectionSetEventType.Add) return;
    // return if element clicked is same as last element selected
    if (CrossProbingApp.lastElementSelected === sourceElementId) return;
    CrossProbingApp.lastElementSelected = sourceElementId;

    const sourceVp = IModelApp.viewManager.selectedView;
    let targetLink;

    // if source is 3D, look for any target 2D elements.
    if (sourceVp?.view.is3d()) {
      targetLink = CrossProbingApp.elementMap!.filter((link: any) => link.physElementId === sourceElementId);
      if (targetLink.length > 0) {
        const targetElement = targetLink[0].drawElementId;
        const targetModel = await ev.set.iModel.models.getProps(targetLink[0].drawModelId);
        const targetViewState = await new ViewCreator2d(ev.set.iModel).getViewForModel(targetModel[0].id!, targetModel[0].classFullName, { bgColor: ColorDef.black });
        const vp2d = CrossProbingApp._get2DViewport();
        vp2d.onChangeView.addOnce(async () => {
          // when view opens, zoom into target 2D element.
          vp2d.zoomToElements(targetElement, { animateFrustumChange: true });
          ev.set.iModel.hilited.elements.addId(targetElement);
        });
        // if target 2D element found, open its view.
        vp2d?.changeView(targetViewState);
      }
    }

    // if source VP is 2D, look for any target 3D elements.
    if (sourceVp?.view.is2d()) {
      targetLink = CrossProbingApp.elementMap!.filter((link: any) => link.drawElementId === sourceElementId);
      if (targetLink.length > 0) {
        const targetElement = targetLink[0].physElementId;
        // if target 3D element found, zoom into it.
        await CrossProbingApp._get3DViewport().zoomToElements(targetElement, { animateFrustumChange: true });
        ev.set.iModel.hilited.elements.addId(targetElement);
      }
    }

    return sourceElementId;
  }

  // helper function to get 3D viewport.
  private static _get3DViewport(): Viewport {
    let vp3d;
    IModelApp.viewManager.forEachViewport((vp) => (vp.view.is3d()) ? vp3d = vp : null);
    if (!vp3d) throw new Error("No viewport with 3D model found!")
    return vp3d;
  }

  // helper function to get 2D viewport.
  private static _get2DViewport(): Viewport {
    let vp2d;
    IModelApp.viewManager.forEachViewport((vp) => (vp.view.is2d()) ? vp2d = vp : null);
    if (!vp2d) throw new Error("No viewport with 2D model found!")
    return vp2d;
  }

  // query to get all 3D/2D connections in iModel.
  // covered in-depth in this blog post: https://medium.com/imodeljs/hablas-bis-90e6f99c8ac2
  public static async loadElementMap(imodel: IModelConnection) {
    const elementMapQuery = `
    SELECT physToFunc.SourceECInstanceId as physElementId, drawToFunc.SourceECInstanceId as drawElementId, drawing.Model.Id as drawModelId 
      FROM Functional.PhysicalElementFulfillsFunction physToFunc 
      JOIN Functional.DrawingGraphicRepresentsFunctionalElement drawToFunc 
        ON physToFunc.TargetECInstanceId = drawToFunc.TargetECInstanceId 
      JOIN Bis.DrawingGraphic drawing 
        ON drawToFunc.SourceECInstanceId = drawing.ECInstanceId`;
    CrossProbingApp.elementMap = await this._executeQuery(imodel, elementMapQuery);
  }

  private static _executeQuery = async (imodel: IModelConnection, query: string) => {
    const rows = [];
    for await (const row of imodel.query(query))
      rows.push(row);

    return rows;
  }

}
