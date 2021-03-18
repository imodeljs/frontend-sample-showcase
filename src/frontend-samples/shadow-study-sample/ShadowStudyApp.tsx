/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { IModelApp } from "@bentley/imodeljs-frontend";

export default class ShadowStudyApp {

  // Updates the sun time for the current model
  public static updateSunTime(time: number) {
    const vp = IModelApp.viewManager.selectedView;

    if (vp && vp.view.is3d()) {
      const displayStyle = vp.view.getDisplayStyle3d();
      displayStyle.setSunTime(time);
      vp.displayStyle = displayStyle;
      vp.synchWithView();
    }
  }
}
