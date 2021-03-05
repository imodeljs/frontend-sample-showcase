/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { BeEvent, Id64String } from "@bentley/bentleyjs-core";
import { ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import { HyperModeling, HyperModelingDecorator, SectionMarker, SectionMarkerHandler } from "@bentley/hypermodeling-frontend";
import "common/samples-common.scss";

/** Dispatches an event when the selected section marker changes. */
class MarkerHandler extends SectionMarkerHandler {
  private _activeMarker?: SectionMarker;

  public readonly onActiveMarkerChanged = new BeEvent<(activeMarker: SectionMarker | undefined) => void>();

  public async activateMarker(marker: SectionMarker, decorator: HyperModelingDecorator): Promise<boolean> {
    const activated = await super.activateMarker(marker, decorator);
    if (activated)
      this.setActiveMarker(marker);

    return activated;
  }

  public async deactivateMarker(marker: SectionMarker, decorator: HyperModelingDecorator): Promise<void> {
    await super.deactivateMarker(marker, decorator);
    this.setActiveMarker(undefined);
  }

  public setActiveMarker(marker: SectionMarker | undefined): void {
    if (marker !== this._activeMarker) {
      this._activeMarker = marker;
      this.onActiveMarkerChanged.raiseEvent(this._activeMarker);
    }
  }

  public reset() {
    this._activeMarker = undefined;
    this.onActiveMarkerChanged.clear();
  }
}

export default class HyperModelingApp {
  public static markerHandler = new MarkerHandler();

  /** Turn on hyper-modeling for the viewport. */
  public static async enableHyperModeling(viewport: ScreenViewport) {
    // The hypermodeling package must be initialized before first use. Often applications will do so just after calling `IModelApp.startup`.
    // It's fine to call it more than once.
    await HyperModeling.initialize({ markerHandler: this.markerHandler });

    // Turn on hypermodeling for the viewport.
    await HyperModeling.startOrStop(viewport, true);
  }

  /** Turn off hyper-modeling for the viewport. */
  public static async disableHyperModeling(viewport: ScreenViewport) {
    this.markerHandler.reset();
    await HyperModeling.startOrStop(viewport, false);
  }

  private static getDecorator(viewport: ScreenViewport): HyperModelingDecorator | undefined {
    return HyperModelingDecorator.getForViewport(viewport);
  }

  /** Switch to the sheet or drawing view associated with the section marker. */
  public static async switchTo2d(viewport: ScreenViewport, marker: SectionMarker, which: "drawing" | "sheet"): Promise<boolean> {
    const decorator = this.getDecorator(viewport);
    if (!decorator)
      return false;

    const promise = "drawing" === which ? decorator.openSection(marker) : decorator.openSheet(marker);
    if (!await promise)
      return false;

    await HyperModeling.startOrStop(viewport, false);
    return true;
  }

  /** Restore a 3d view and activate the specified section marker. */
  public static async switchTo3d(viewport: ScreenViewport, view: ViewState, activeMarkerId: Id64String): Promise<void> {
    viewport.changeView(view);
    const decorator = await HyperModeling.startOrStop(viewport, true);
    if (!decorator)
      return;

    for (const marker of decorator.markers.markers) {
      if (marker.state.id === activeMarkerId) {
        decorator.setActiveMarker(marker);
        break;
      }
    }
  }

  public static clearActiveMarker(viewport: ScreenViewport) {
    this.getDecorator(viewport)?.setActiveMarker(undefined);
  }

  /** Toggle whether 2d section graphics and sheet annotations are displayed in the 3d view. */
  public static toggle2dGraphics(display2d: boolean) {
    HyperModeling.updateConfiguration({
      graphics: {
        hideSectionGraphics: !display2d,
        hideSheetAnnotations: !display2d,
      },
    });
  }
}
