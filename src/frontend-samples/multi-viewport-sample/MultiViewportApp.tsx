/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp, ScreenViewport, SelectedViewportChangedArgs, TwoWayViewportSync, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class MultiViewportApp {
  public static twoWaySync: TwoWayViewportSync = new TwoWayViewportSync();
  public static listenerCallbacks: Array<() => void> = [];

  /** Connects the views of the two provided viewports, overriding the second parameter's view with the first's view. */
  public static connectViewports(vp1: Viewport, vp2: Viewport) {
    MultiViewportApp.twoWaySync.connect(vp1, vp2);
  }
  /** Disconnects all viewports that have been synced using this instance of [TwoWayViewportSync]. */
  public static disconnectViewports() {
    MultiViewportApp.twoWaySync.disconnect();
  }

  /** Drops all active listeners. */
  public static dispose() {
    MultiViewportApp.listenerCallbacks.forEach((removeListener) => removeListener());
    MultiViewportApp.listenerCallbacks.length = 0;
  }

  /** Adds a listener to IModelApp for when the selected Viewport changes.  The app will ensure the listener is removed when no longer relevant. */
  public static listenForSelectedViewportChange(onChange: (args: SelectedViewportChangedArgs) => void) {
    if (false === IModelApp.viewManager.onSelectedViewportChanged.has(onChange)) {
      const removeListener = IModelApp.viewManager.onSelectedViewportChanged.addListener(onChange);
      MultiViewportApp.listenerCallbacks.push(removeListener);
    }
  }

  /** Adds a listener to IModelApp for when a View is opened.  The app will ensure the listener is removed when no longer relevant. */
  public static listenForViewOpened(onOpen: (args: ScreenViewport) => void) {
    if (false === IModelApp.viewManager.onViewOpen.has(onOpen)) {
      const removeListener = IModelApp.viewManager.onViewOpen.addListener(onOpen);
      MultiViewportApp.listenerCallbacks.push(removeListener);
    }
  }

  /** Adds a listener to IModelApp for when a View is opened.  The app will ensure the listener is removed when no longer relevant. */
  public static listenForViewClosed(onOpen: (args: ScreenViewport) => void) {
    if (false === IModelApp.viewManager.onViewOpen.has(onOpen)) {
      const removeListener = IModelApp.viewManager.onViewClose.addListener(onOpen);
      MultiViewportApp.listenerCallbacks.push(removeListener);
    }
  }
}
