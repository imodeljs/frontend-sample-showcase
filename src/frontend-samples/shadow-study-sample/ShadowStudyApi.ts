/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { DisplayStyle3dState, IModelApp, IModelConnection, ScreenViewport, ViewState } from "@itwin/core-frontend";
import { ViewFlags } from "@itwin/core-common";
import { ViewSetup } from "@itwin/sandbox";

export default class ShadowStudyApp {

  // updates the sun time for the current model
  public static updateSunTime(time: number): void {
    const vp: ScreenViewport | undefined = IModelApp.viewManager.selectedView;

    if (vp && vp.view.is3d()) {
      const displayStyle: DisplayStyle3dState = vp.view.getDisplayStyle3d();
      displayStyle.setSunTime(time);
      vp.displayStyle = displayStyle;
      vp.synchWithView();
    }
  }

  /**
   * Initialize the data view when a new iModel is loaded
   */
  public static getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState: ViewState = await ViewSetup.getDefaultView(imodel);
    const vf: ViewFlags = viewState.viewFlags.override({ shadows: true });

    if (viewState.is3d()) {
      const viewStyle: DisplayStyle3dState = viewState.getDisplayStyle3d();
      viewStyle.setSunTime(new Date().getTime());
      viewState.displayStyle = viewStyle;
    }

    viewState.displayStyle.viewFlags = vf;

    return viewState;
  };
}
