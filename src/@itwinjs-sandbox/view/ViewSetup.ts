/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Id64, Id64String } from "@bentley/bentleyjs-core";
import { BackgroundMapProps, ColorDef } from "@bentley/imodeljs-common";
import { AuthorizedFrontendRequestContext, DrawingViewState, Environment, IModelApp, IModelConnection, SpatialViewState, StandardViewId, ViewState } from "@bentley/imodeljs-frontend";
import { Point3d, Vector3d } from "@bentley/geometry-core";
import { SettingsMapResult, SettingsStatus } from "@bentley/product-settings-client";

export type ViewType = "3D" | "2D";
export class ViewSetup {

  public static getViewState(imodel: IModelConnection, viewType: ViewType = "3D"): SpatialViewState {
    const ext = imodel.projectExtents;
    const viewState = SpatialViewState.createBlank(imodel, ext.low, ext.high.minus(ext.low));
    if (viewType === "3D") {
      viewState.setAllow3dManipulations(true);
      viewState.lookAt(new Point3d(15, 15, 15), new Point3d(0, 0, 0), new Vector3d(0, 0, 1));
    } else {
      viewState.setAllow3dManipulations(false);
      viewState.setStandardRotation(StandardViewId.Top);
    }
    viewState.displayStyle.backgroundColor = ColorDef.white;
    if (!imodel.iModelId) {
      viewState.viewFlags.grid = true;
    } else {
      viewState.viewFlags.grid = false;
    }
    return viewState;
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
      const viewState3d = viewState;
      const displayStyle = viewState3d.getDisplayStyle3d();

      displayStyle.changeBackgroundMapProps({ useDepthBuffer: true });
      const groundBias: number | undefined = await ViewSetup.getGroundBias(imodel);
      if (groundBias) {
        displayStyle.changeBackgroundMapProps({ groundBias });
      }

      // Enable the sky-box, but override the ugly brown color.
      displayStyle.environment = new Environment({
        sky: {
          display: true,
          nadirColor: ColorDef.computeTbgrFromComponents(64, 74, 66),
        },
      });
    }

    return viewState;
  }

  /** Pick the first available spatial view definition in the imodel */
  public static async getFirstViewDefinitionId(imodel: IModelConnection): Promise<Id64String> {
    // Return default view definition (if any)
    const defaultViewId = await imodel.views.queryDefaultViewId();
    if (Id64.isValid(defaultViewId))
      return defaultViewId;

    // Return first spatial view definition (if any)
    const spatialViews: IModelConnection.ViewSpec[] = await imodel.views.getViewList({ from: SpatialViewState.classFullName });
    if (spatialViews.length > 0)
      return spatialViews[0].id;

    // Return first drawing view definition (if any)
    const drawingViews: IModelConnection.ViewSpec[] = await imodel.views.getViewList({ from: DrawingViewState.classFullName });
    if (drawingViews.length > 0)
      return drawingViews[0].id;

    throw new Error("No valid view definitions in imodel");
  }

  public static getAspectRatio(): number | undefined {
    const viewDiv = document.getElementById("sample-container");

    if (null === viewDiv)
      return undefined;

    return viewDiv.clientWidth / viewDiv.clientHeight;
  }

  /*
  * groundBias can be stored in Product Settings Service. This method retrieves it.
  */
  public static getGroundBias = async (imodel: IModelConnection): Promise<number | undefined> => {
    const requestContext = await AuthorizedFrontendRequestContext.create();

    const allSettings: SettingsMapResult = await IModelApp.settings.getSharedSettingsByNamespace(
      requestContext,
      "bingMapSettings",
      true,
      imodel.contextId!,
      imodel.iModelId,
    );
    if (
      allSettings.status === SettingsStatus.Success &&
      allSettings.settingsMap &&
      allSettings.settingsMap.has("backgroundMapSetting")
    ) {
      const bgMapSettings = allSettings.settingsMap.get(
        "backgroundMapSetting",
      ) as BackgroundMapProps;

      if (undefined !== bgMapSettings.groundBias)
        return bgMapSettings.groundBias;
    }

    return undefined;
  }
}
