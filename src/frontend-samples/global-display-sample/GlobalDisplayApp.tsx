/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { Angle } from "@bentley/geometry-core";
import { BingLocationProvider, GlobalLocation, queryTerrainElevationOffset, ScreenViewport } from "@bentley/imodeljs-frontend";
import { request } from "@bentley/itwin-client";
import "common/samples-common.scss";

export default class GlobalDisplayApp {
  private static _locationProvider?: BingLocationProvider;

  public static get locationProvider(): BingLocationProvider {
    return this._locationProvider || (this._locationProvider = new BingLocationProvider());
  }

  public static async travelTo(viewport: ScreenViewport, destination: string): Promise<boolean> {
    const location = await this.locationProvider.getLocation(destination);
    if (!location)
      return false;

    const elevationOffset = await queryTerrainElevationOffset(viewport, location.center);
    if (elevationOffset !== undefined)
      location.center.height = elevationOffset;

    await viewport.animateFlyoverToGlobalLocation(location);
    return true;
  }
}

