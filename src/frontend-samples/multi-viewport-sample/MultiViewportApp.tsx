/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, ScreenViewport, SelectedViewportChangedArgs, TwoWayViewportSync, Viewport } from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import * as React from "react";
import MultiViewportUI from "./MultiViewportUI";

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class MultiViewportApp implements SampleApp {
  public static twoWaySync: TwoWayViewportSync = new TwoWayViewportSync();
  private static _selectedViewportChangedListeners: Array<() => void> = [];
  private static _viewOpenedListeners: Array<() => void> = [];
  private static _teardownListener: Array<() => void> = [];

  /** Called by the showcase before the sample is started. */
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    MultiViewportApp._selectedViewportChangedListeners.length = 0;
    MultiViewportApp._teardownListener.length = 0;
    MultiViewportApp._viewOpenedListeners.length = 0;
    return <MultiViewportUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** Called by the showcase before swapping to another sample. */
  public static async teardown() {
    MultiViewportApp.disconnectViewports();
    MultiViewportApp._selectedViewportChangedListeners.forEach((removeListener) => removeListener());
    MultiViewportApp._selectedViewportChangedListeners.length = 0;
    MultiViewportApp._viewOpenedListeners.forEach((removeListener) => removeListener());
    MultiViewportApp._viewOpenedListeners.length = 0;
    MultiViewportApp._teardownListener.forEach((removeListener) => removeListener());
    MultiViewportApp._teardownListener.length = 0;
  }
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
      MultiViewportApp._selectedViewportChangedListeners.push(removeListener);
    }
  }

  /** Adds a listener to IModalApp for when a View is opened.  The app will ensure the listener is removed when no longer relevant. */
  public static listenForViewOpened(onOpen: (args: ScreenViewport) => void) {
    if (false === IModelApp.viewManager.onViewOpen.has(onOpen)) {
      const removeListener = IModelApp.viewManager.onViewOpen.addListener(onOpen);
      MultiViewportApp._viewOpenedListeners.push(removeListener);
    }
  }

  /** Adds a adds a callback for when the app teardown is called. */
  public static listenForAppTeardown(listener: () => void) {
    MultiViewportApp._teardownListener.push(listener);
  }

  /** Signal viewport to sync with an updated [ViewState] using the Viewport API. */
  public static syncViewportWithView(vp: Viewport) {
    vp.synchWithView();
  }
}

/* Notes about tracking of open views:
 *  The [IModelApp.viewManager] has events [onViewOpen] (used above) and [onViewClose].
 *  These event can be used to track the currently open viewports.  Any Listeners added to these
 *  events will need to removed else they will continue to be called.
 *
 *  This sample in above [listenForAppTeardown] is used in place of [onViewClose] due to limitations
 *  from running as part of a suite of samples.  If it was used, it would be implemented the same as the
 *  [onViewOpen], but the UI would only removed the viewport matching the viewportId from the state
 *  instead of resetting the whole state.
 */
