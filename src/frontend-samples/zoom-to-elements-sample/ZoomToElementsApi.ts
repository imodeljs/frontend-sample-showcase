/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { IModelApp, StandardViewId, ViewChangeOptions, ZoomToOptions } from "@itwin/core-frontend";

export interface ZoomOptions {
  animateEnable: boolean;
  animateVal: boolean;
  relativeViewEnable: boolean;
  relativeViewVal: StandardViewId;
  standardViewEnable: boolean;
  standardViewVal: StandardViewId;
}

export default class ZoomToElementsApi {

  public static zoomToElements = async (elements: string[], options: ZoomOptions) => {
    const viewChangeOpts: ViewChangeOptions = {};
    if (options.animateEnable)
      viewChangeOpts.animateFrustumChange = options.animateVal;
    const zoomToOpts: ZoomToOptions = {};
    if (options.relativeViewEnable)
      zoomToOpts.placementRelativeId = options.relativeViewVal;
    if (options.standardViewEnable)
      zoomToOpts.standardViewId = options.standardViewVal;
    const vp = IModelApp.viewManager.selectedView!;
    // Set the view to point at a volume containing the list of elements
    await vp.zoomToElements(elements, { ...viewChangeOpts, ...zoomToOpts });
  };
}
