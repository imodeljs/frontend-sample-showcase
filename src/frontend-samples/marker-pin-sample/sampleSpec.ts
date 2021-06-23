/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleSpec } from "SampleSpec";
import walkthrough from "!walkthrough-loader!./walkthru.md";

export function getMarkerPinSpec(): SampleSpec {
  return ({
    name: "marker-pin-sample",
    label: "Marker Pins",
    image: "marker-pin-thumbnail.png",
    walkthrough,
    description: "Uses a #Decorator and a #MarkerSet to display #markers that indicate important locations in a model.",
    iTwinViewerReady: true,
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      { name: "MarkerPinApi.ts", import: import("!editor-file-loader!./MarkerPinApi.ts") },
      { name: "MarkerPinWidget.tsx", import: import("!editor-file-loader!./MarkerPinWidget.tsx") },
      { name: "MarkerPinApp.tsx", import: import("!editor-file-loader!./MarkerPinApp.tsx"), entry: true },
      { name: "MarkerPinDecorator.tsx", import: import("!editor-file-loader!./MarkerPinDecorator") },
      { name: "MarkerPin.scss", import: import("!editor-file-loader!./MarkerPin.scss") },
      { name: "PlaceMarkerTool.ts", import: import("!editor-file-loader!./PlaceMarkerTool") },
      { name: "PopupMenu.tsx", import: import("!editor-file-loader!./PopupMenu") },
      { name: "RadioCard.tsx", import: import("!editor-file-loader!./RadioCard") },
      { name: "RadioCard.scss", import: import("!editor-file-loader!./RadioCard.scss") },
    ],
    type: "MarkerPinApp.tsx",
  });
}
