/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ColorDef, ContextRealityModelProps } from "@bentley/imodeljs-common";
import { DrawingViewState, Environment, IModelConnection, SpatialViewState, ViewState, ViewState3d, findAvailableUnattachedRealityModels } from "@bentley/imodeljs-frontend";
import { Id64, Id64String } from "@bentley/bentleyjs-core";

export class ViewSetup {

  /** Pick the first available spatial view definition in the imodel */
  private static async getFirstViewDefinitionId(imodel: IModelConnection): Promise<Id64String> {
    // Return default view definition (if any)
    const defaultViewId = await imodel.views.queryDefaultViewId();
    if (Id64.isValid(defaultViewId))
      return defaultViewId;

    // Return first spatial view definition (if any)
    const spatialViews: IModelConnection.ViewSpec[] = await imodel.views.getViewList({ from: SpatialViewState.classFullName });
    if (spatialViews.length > 0)
      return spatialViews[0].id!;

    // Return first drawing view definition (if any)
    const drawingViews: IModelConnection.ViewSpec[] = await imodel.views.getViewList({ from: DrawingViewState.classFullName });
    if (drawingViews.length > 0)
      return drawingViews[0].id!;

    throw new Error("No valid view definitions in imodel");
  }

  public static getAspectRatio(): number | undefined {
    const viewDiv = document.getElementById("sample-container");

    if (null === viewDiv)
      return undefined;

    return viewDiv.clientWidth / viewDiv.clientHeight;
  }

  public static getDefaultView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewId = await ViewSetup.getFirstViewDefinitionId(imodel);

    // Load the view state using the viewSpec's ID
    const viewState = await imodel.views.load(viewId);

    const aspect = ViewSetup.getAspectRatio();
    if (undefined !== aspect) {
      const extents = viewState.getExtents();
      const origin = viewState.getOrigin();
      viewState.adjustViewDelta(extents, origin, viewState.getRotation(), aspect);
      viewState.setExtents(extents);
      viewState.setOrigin(origin);
    }

    viewState.viewFlags.shadows = false;
    viewState.viewFlags.grid = false;

    if (viewState.is3d()) {
      const viewState3d = viewState as ViewState3d;
      const displayStyle = viewState3d.getDisplayStyle3d();

      displayStyle.changeBackgroundMapProps({ useDepthBuffer: true });

      // Enable the sky-box, but override the ugly brown color.
      displayStyle.environment = new Environment({
        sky: {
          display: true,
          nadirColor: ColorDef.computeTbgrFromComponents(64, 74, 66),
        },
      });
    }

    if (viewState.isSpatialView()) {
      const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
      for (const crmProp of availableModels) {
        viewState.displayStyle.attachRealityModel(crmProp);
      }
    }

    return viewState;
  }
}
