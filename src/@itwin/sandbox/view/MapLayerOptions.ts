/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { MapLayerOptions } from "@itwin/core-frontend";

export const mapLayerOptions: MapLayerOptions = {
  BingMaps: {
    key: "BingKey",
    value: process.env.REACT_APP_BING_KEY as string,
  },
  MapBoxImagery: {
    key: "MapBoxKey",
    value: process.env.REACT_APP_MAPBOX_KEY as string,
  },
};
