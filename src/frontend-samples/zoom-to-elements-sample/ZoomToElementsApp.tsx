/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { IModelApp, IModelConnection, MarginPercent, ViewChangeOptions, Viewport, ZoomToOptions } from "@bentley/imodeljs-frontend";
import ZoomToElementsUI, { ZoomToState } from "./ZoomToElementsUI";

class ZoomToElementsAPI {
  public static async zoomToElements(elementIds: string[], viewChangeOpts: ViewChangeOptions, zoomToOpts: ZoomToOptions, vp: Viewport, imodel: IModelConnection) {

    // Set the view to point at a volume containing the list of elements
    await vp.zoomToElements(elementIds, { ...viewChangeOpts, ...zoomToOpts });

    // Select the elements.  This is not necessary, but it makes them easier to see.
    imodel.selectionSet.replace(elementIds);
  }
}

export default class ViewClipApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ZoomToElementsUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }
}

export const zoomToElements = (state: ZoomToState) => {
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
  // tslint:disable-next-line no-floating-promises
  ZoomToElementsAPI.zoomToElements(state.elementList, viewChangeOpts, zoomToOpts, vp, state.imodel!);
};
