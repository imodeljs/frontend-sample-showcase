/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp, ScreenViewport, SelectedViewportChangedArgs, TwoWayViewportSync, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class MultiViewportApp {
  public static twoWaySync: TwoWayViewportSync = new TwoWayViewportSync();
  public static selectedViewportChangedListeners: Array<() => void> = [];
  public static viewOpenedListeners: Array<() => void> = [];
  public static teardownListener: Array<() => void> = [];

  /** Connects the views of the two provided viewports, overriding the second parameter's view with the first's view. */
  public static connectViewports(vp1: Viewport, vp2: Viewport) {
    MultiViewportApp.twoWaySync.connect(vp1, vp2);
  }
  /** Disconnects all viewports that have been synced using this instance of [TwoWayViewportSync]. */
  public static disconnectViewports() {
    MultiViewportApp.twoWaySync.disconnect();
  }

  /** Adds a listener to IModalApp for when the selected Viewport changes.  The app will ensure the listener is removed when no longer relevant. */
  public static listenForSelectedViewportChange(onChange: (args: SelectedViewportChangedArgs) => void) {
    if (false === IModelApp.viewManager.onSelectedViewportChanged.has(onChange)) {
      const removeListener = IModelApp.viewManager.onSelectedViewportChanged.addListener(onChange);
      MultiViewportApp.selectedViewportChangedListeners.push(removeListener);
    }
  }

  /** Adds a listener to IModalApp for when a View is opened.  The app will ensure the listener is removed when no longer relevant. */
  public static listenForViewOpened(onOpen: (args: ScreenViewport) => void) {
    if (false === IModelApp.viewManager.onViewOpen.has(onOpen)) {
      const removeListener = IModelApp.viewManager.onViewOpen.addListener(onOpen);
      MultiViewportApp.viewOpenedListeners.push(removeListener);
    }
  }

  /** Adds a adds a callback for when the app teardown is called. See description in readme for typical implementation */
  public static listenForAppTeardown(listener: () => void) {
    MultiViewportApp.teardownListener.push(listener);
  }

  /** Signal viewport to sync with an updated [ViewState] using the Viewport API. */
  public static syncViewportWithView(vp: Viewport) {
    vp.synchWithView();
  }
}
