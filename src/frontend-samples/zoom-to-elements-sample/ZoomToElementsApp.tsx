/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, MarginPercent, ViewChangeOptions, ZoomToOptions } from "@bentley/imodeljs-frontend";
import ZoomToElementsUI, { ZoomToState } from "./ZoomToElementsUI";
import SampleApp from "common/SampleApp";

export default class ZoomToElementsApp implements SampleApp {
  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void) {
    return <ZoomToElementsUI iModelName={iModelName} setupControlPane={setupControlPane} />;
  }

  public static zoomToElements = async (state: ZoomToState) => {
    const viewChangeOpts: ViewChangeOptions = {};
    if (state.animateEnable)
      viewChangeOpts.animateFrustumChange = state.animateVal;
    if (state.marginEnable)
      viewChangeOpts.marginPercent = new MarginPercent(state.marginVal, state.marginVal, state.marginVal, state.marginVal);
    const zoomToOpts: ZoomToOptions = {};
    if (state.relativeViewEnable)
      zoomToOpts.placementRelativeId = state.relativeViewVal;
    if (state.standardViewEnable)
      zoomToOpts.standardViewId = state.standardViewVal;
    const vp = IModelApp.viewManager.selectedView!;
    // Set the view to point at a volume containing the list of elements
    await vp.zoomToElements(state.elementList, { ...viewChangeOpts, ...zoomToOpts });

    // Select the elements.  This is not necessary, but it makes them easier to see.
    state.imodel!.selectionSet.replace(state.elementList);
  }
}
