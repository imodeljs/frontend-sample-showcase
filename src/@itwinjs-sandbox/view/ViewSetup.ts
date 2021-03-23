/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Id64, Id64Array, Id64String } from "@bentley/bentleyjs-core";
import { BackgroundMapProps, ColorDef } from "@bentley/imodeljs-common";
import { AuthorizedFrontendRequestContext, DrawingViewState, Environment, IModelApp, IModelConnection, SpatialViewState, ViewState } from "@bentley/imodeljs-frontend";
import { SettingsMapResult, SettingsStatus } from "@bentley/product-settings-client";

export type ViewType = "3D" | "2D";
export class ViewSetup {
  /** Queries for and loads the default view for an iModel. */
  public static getDefaultView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewId = await ViewSetup.getFirstViewDefinitionId(imodel);

    // Load the view state using the viewSpec's ID
    const viewState = await imodel.views.load(viewId);

    // Making some improvements to the default views.
    await ViewSetup.overrideView(imodel, viewState);

    return viewState;
  };

  /** Pick the first available spatial view definition in the imodel */
  private static async getFirstViewDefinitionId(imodel: IModelConnection): Promise<Id64String> {
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

  /** Returns the aspect ration of the container the view will be created in. */
  public static getAspectRatio(): number | undefined {
    const viewDiv = document.getElementById("sample-container");

    if (null === viewDiv)
      return undefined;

    return viewDiv.clientWidth / viewDiv.clientHeight;
  }

  /** Makes ascetic changes to the default view */
  public static async overrideView(imodel: IModelConnection, viewState: ViewState) {
    const aspect = ViewSetup.getAspectRatio();
    if (undefined !== aspect) {
      const extents = viewState.getExtents();
      const origin = viewState.getOrigin();
      viewState.adjustViewDelta(extents, origin, viewState.getRotation(), aspect);
      viewState.setExtents(extents);
      viewState.setOrigin(origin);
    }

    const viewFlags = viewState.viewFlags.clone();
    viewFlags.shadows = false;
    viewFlags.grid = false;
    viewState.displayStyle.viewFlags = viewFlags;

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

    const hiddenCategories = await ViewSetup.getHiddenCategories(imodel);
    if (hiddenCategories)
      viewState.categorySelector.dropCategories(hiddenCategories);
  }

  /** Queries for categories that are unnecessary in the context of the of the sample showcase. */
  private static getHiddenCategories = async (imodel: IModelConnection): Promise<Id64Array | undefined> => {
    const ids: Id64String[] = [];
    const addIdsByCategory = async (...categoryCodes: string[]) => {
      const selectInCategories = `SELECT ECInstanceId FROM bis.Category WHERE CodeValue IN ('${categoryCodes.join("','")}')`;
      for await (const row of imodel.query(selectInCategories))
        ids.push(row.id);
    };
    if (imodel.name === "house bim upload")
      // The callout graphics in the house model are ugly - don't display them.
      await addIdsByCategory("Callouts");

    if (imodel.name === "Metrostation2")
      // There is coincident geometry. Remove the more visible instances.
      await addIdsByCategory("A-WALL-LINE", "A-FLOR-OTLN");

    return ids;
  };

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
  };
}
