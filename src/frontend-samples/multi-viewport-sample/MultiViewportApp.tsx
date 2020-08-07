/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import SampleApp from "common/SampleApp";
import MultiViewportUI from "./MultiViewportUI";
import { IModelApp, TwoWayViewportSync, Viewport, SelectedViewportChangedArgs, ScreenViewport } from "@bentley/imodeljs-frontend";
import { RenderMode } from "@bentley/imodeljs-common";

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class MultiViewportApp implements SampleApp {
  public static twoWaySync: TwoWayViewportSync = new TwoWayViewportSync();
  private static _selectedViewportChangedListeners: Array<(args: SelectedViewportChangedArgs) => void> = [];
  private static _viewOpenedListeners: Array<(args: ScreenViewport) => void> = [];

  /** Called by the showcase before the sample is started. */
  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode, className?: string) => void) {
    MultiViewportApp._selectedViewportChangedListeners.length = 0;
    MultiViewportApp._viewOpenedListeners.length = 0;
    console.debug("start");
    return <MultiViewportUI iModelName={iModelName} setupControlPane={setupControlPane} />;
  }

  /** Called by the showcase before swapping to another sample. */
  public static async teardown() {
    MultiViewportApp.disconnectViewports();
    MultiViewportApp._selectedViewportChangedListeners.forEach(
      (listener) => { IModelApp.viewManager.onSelectedViewportChanged.removeListener(listener); });
    MultiViewportApp._selectedViewportChangedListeners.length = 0;
    MultiViewportApp._viewOpenedListeners.forEach(
      (listener) => { IModelApp.viewManager.onViewOpen.removeListener(listener); });
    MultiViewportApp._viewOpenedListeners.length = 0;
    console.debug("teardown");
  }
  /** Connects the views of the two provided viewports. */
  public static connectViewports(vp1: Viewport, vp2: Viewport) {
    MultiViewportApp.twoWaySync.connect(vp1, vp2);
  }
  /** Disconnects all viewports that have been synced using this instance of [TwoWayViewportSync]. */
  public static disconnectViewports() {
    MultiViewportApp.twoWaySync.disconnect();
  }

  /** Adds a listener to IModalApp for when the selected Viewport changes.  The app will ensure the listener is removed when no longer relevant. */
  public static listenForSelectedViewportChange(onChange: (args: SelectedViewportChangedArgs) => void) {
    MultiViewportApp._selectedViewportChangedListeners.push(onChange);
    IModelApp.viewManager.onSelectedViewportChanged.addListener(onChange);
  }

  /** Adds a listener to IModalApp for when a View is opened.  The app will ensure the listener is removed when no longer relevant. */
  public static listenForViewOpened(onOpen: (args: ScreenViewport) => void) {
    MultiViewportApp._viewOpenedListeners.push(onOpen);
    IModelApp.viewManager.onViewOpen.addListener(onOpen);
  }

  /** Modify render mode setting using the Viewport API. */
  public static setRenderMode(vp: Viewport, mode: RenderMode) {
    const viewFlags = vp.viewFlags.clone();
    viewFlags.renderMode = mode;
    vp.viewFlags = viewFlags;
  }

  /** Signal viewport to sync with an updated [ViewState] using the Viewport API. */
  public static syncViewportWithView(vp: Viewport) {
    vp.synchWithView();
  }
}
