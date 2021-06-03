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
    description: "Uses a #Decorator and a #MarkerSet to display #markers that indicate important locations in a model.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "MarkerPinApi.ts", import: import("!!raw-loader!./MarkerPinApi.ts") },
      { name: "MarkerPinWidget.tsx", import: import("!!raw-loader!./MarkerPinWidget.tsx") },
      { name: "MarkerPinApp.tsx", import: import("!!raw-loader!./MarkerPinApp.tsx"), entry: true },
      { name: "MarkerPinDecorator.tsx", import: import("!!raw-loader!./MarkerPinDecorator") },
      { name: "MarkerPin.scss", import: import("!!raw-loader!./MarkerPin.scss") },
      { name: "PlaceMarkerTool.ts", import: import("!!raw-loader!./PlaceMarkerTool") },
      { name: "PopupMenu.tsx", import: import("!!raw-loader!./PopupMenu") },
      { name: "RadioCard.tsx", import: import("!!raw-loader!./RadioCard") },
      { name: "RadioCard.scss", import: import("!!raw-loader!./RadioCard.scss") },
    ],
    type: "MarkerPinApp.tsx",
  });
}
