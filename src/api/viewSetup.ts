/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection, Viewport, SpatialViewState, DrawingViewState, ViewState } from "@bentley/imodeljs-frontend";
import { Id64String, Id64 } from "@bentley/bentleyjs-core";

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

    public static getDefaultView = async (imodel: IModelConnection): Promise<ViewState> => {
        const viewId = await ViewSetup.getFirstViewDefinitionId(imodel);

        // Load the view state using the viewSpec's ID
        return await imodel.views.load(viewId);
    }

    public static applyDefaultView = async (imodel: IModelConnection, vp: Viewport) => {
        const viewId = await ViewSetup.getFirstViewDefinitionId(imodel);

        // Load the view state using the viewSpec's ID
        const viewState = await ViewSetup.getDefaultView(imodel);

        // Change viewport state
        vp.changeView(viewState, { animateFrustumChange: false });
    }
}
