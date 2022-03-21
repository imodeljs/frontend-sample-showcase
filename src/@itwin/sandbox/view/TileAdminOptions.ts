/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { TileAdmin } from "@itwin/core-frontend";

export const tileAdminOptions: TileAdmin.Props = {
  cesiumIonKey: process.env.REACT_APP_CESIUMION_KEY,
};
