/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";

export function getMarkerPinSpec(): SampleSpec {
  return ({
    name: "marker-pin-sample",
    label: "Marker Pins",
    image: "marker-pin-thumbnail.png",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "MarkerPinApi.ts", import: import("!!raw-loader!./MarkerPinApi.ts") },
      { name: "MarkerPinWidget.tsx", import: import("!!raw-loader!./MarkerPinWidget.tsx") },
      { name: "MarkerPinApp.tsx", import: import("!!raw-loader!./MarkerPinApp.tsx"), entry: true },
      { name: "MarkerPinDecorator.tsx", import: import("!!raw-loader!./MarkerPinDecorator") },
      { name: "PlaceMarkerTool.ts", import: import("!!raw-loader!./PlaceMarkerTool") },
      { name: "PopupMenu.tsx", import: import("!!raw-loader!./PopupMenu") },
      { name: "MarkerPin.scss", import: import("!!raw-loader!./MarkerPin.scss") },
    ],
    type: "MarkerPinApp.tsx",
  });
}
