/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { BeEvent } from "@bentley/bentleyjs-core";
import { ScreenViewport } from "@bentley/imodeljs-frontend";
import { HyperModeling, HyperModelingDecorator, SectionMarker, SectionMarkerHandler } from "@bentley/hypermodeling-frontend";
import "common/samples-common.scss";

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

  public static async enableHyperModeling(viewport: ScreenViewport) {
    await HyperModeling.initialize({ markerHandler: this.markerHandler });
    await HyperModeling.startOrStop(viewport, true);
  }

  public static async disableHyperModeling(viewport: ScreenViewport) {
    this.markerHandler.reset();
    await HyperModeling.startOrStop(viewport, false);
  }

  private static getDecorator(viewport: ScreenViewport): HyperModelingDecorator | undefined {
    return HyperModelingDecorator.getForViewport(viewport);
  }

  public static async switchToDrawingView(viewport: ScreenViewport, marker: SectionMarker) {
    const decorator = this.getDecorator(viewport);
    if (decorator && await decorator.openSection(marker))
      {}// this.markerHandler.setActiveMarker(undefined);
  }

  public static async switchToSheetView(viewport: ScreenViewport, marker: SectionMarker) {
    const decorator = this.getDecorator(viewport);
    if (decorator && await decorator.openSheet(marker))
      {}// this.markerHandler.setActiveMarker(undefined);
  }
}
