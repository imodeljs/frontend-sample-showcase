/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ClientRequestContext } from "@bentley/bentleyjs-core";
import { Angle } from "@bentley/geometry-core";
import { Cartographic } from "@bentley/imodeljs-common";
import { /* BingLocationProvider, */ GlobalLocation, IModelApp, queryTerrainElevationOffset, ScreenViewport } from "@bentley/imodeljs-frontend";
import { request } from "@bentley/itwin-client";
import "common/samples-common.scss";

// ###TODO Ray forgot to export BingLocationProvider from imodeljs-frontend.
class BingLocationProvider {
  private _locationRequestTemplate: string;
  protected _requestContext = new ClientRequestContext("");

  public constructor() {
    const bingKey = IModelApp.mapLayerFormatRegistry.configOptions.BingMaps?.value ?? "";
    this._locationRequestTemplate = "https://dev.virtualearth.net/REST/v1/Locations?query={query}&key={BingMapsAPIKey}".replace("{BingMapsAPIKey}", bingKey);
  }

  public async getLocation(query: string): Promise<GlobalLocation | undefined> {
    const requestUrl = this._locationRequestTemplate.replace("{query}", query);
    const requestOptions = { method: "GET", responseType: "json" };
    try {
      const locationResponse = await request(this._requestContext, requestUrl, requestOptions);
      const point = locationResponse.body.resourceSets[0].resources[0].point;
      const bbox = locationResponse.body.resourceSets[0].resources[0].bbox;
      const southLatitude = bbox[0];
      const westLongitude = bbox[1];
      const northLatitude = bbox[2];
      const eastLongitude = bbox[3];
      return {
        center: Cartographic.fromRadians(Angle.degreesToRadians(point.coordinates[1]), Angle.degreesToRadians(point.coordinates[0])),
        area: {
          southwest: Cartographic.fromRadians(Angle.degreesToRadians(westLongitude), Angle.degreesToRadians(southLatitude)),
          northeast: Cartographic.fromRadians(Angle.degreesToRadians(eastLongitude), Angle.degreesToRadians(northLatitude)),
        },
      };
    } catch (error) {
      return undefined;
    }
  }
}

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

