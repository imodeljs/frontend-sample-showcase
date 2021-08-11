/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { Viewport } from "@bentley/imodeljs-frontend";
import { TwoWayViewportSync } from "./TwoWayViewportSync";

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class TransformationsApi {
  public static readonly Transformation_Id = "e4744f6d-bb08-4932-20e6-08d952925fd1";
  public static twoWaySync: TwoWayViewportSync = new TwoWayViewportSync();

  /** Connects the views of the two provided viewports, overriding the second parameter's view with the first's view. */
  public static connectViewports(vp1: Viewport, vp2: Viewport) {
    TransformationsApi.twoWaySync.connect(vp1, vp2);
  }
  /** Disconnects all viewports that have been synced using this instance of [TwoWayViewportSync]. */
  public static disconnectViewports() {
    TransformationsApi.twoWaySync.disconnect();
  }
}
