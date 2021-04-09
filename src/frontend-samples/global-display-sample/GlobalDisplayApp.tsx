/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { BingLocationProvider, queryTerrainElevationOffset, ScreenViewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";

export default class GlobalDisplayApp {
  private static _locationProvider?: BingLocationProvider;

  /** Provides conversion from a place name to a location on the Earth's surface. */
  public static get locationProvider(): BingLocationProvider {
    return this._locationProvider || (this._locationProvider = new BingLocationProvider());
  }

  /** Given a place name - whether a specific address or a more freeform description like "New Zealand", "Ol' Faithful", etc -
   * look up its location on the Earth and, if found, use a flyover animation to make the viewport display that location.
   */
  public static async travelTo(viewport: ScreenViewport, destination: string): Promise<boolean> {
    // Obtain latitude and longitude.
    const location = await this.locationProvider.getLocation(destination);
    if (!location)
      return false;

    // Determine the height of the Earth's surface at this location.
    const elevationOffset = await queryTerrainElevationOffset(viewport, location.center);
    if (elevationOffset !== undefined)
      location.center.height = elevationOffset;

    // "Fly" to the location.
    await viewport.animateFlyoverToGlobalLocation(location);
    return true;
  }
}

