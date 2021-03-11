/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleMetadata } from "../../Components/SampleShowcase/SampleShowcase";
import MarkerPinUI from "./MarkerPinUI";

export function getMarkerPinSpec(): SampleMetadata {
  return ({
    name: "marker-pin-sample",
    label: "Marker Pins",
    image: "marker-pin-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "MarkerPinApp.tsx", import: import("!!raw-loader!./MarkerPinApp.tsx") },
      { name: "MarkerPinUI.tsx", import: import("!!raw-loader!./MarkerPinUI.tsx"), entry: true },
      { name: "MarkerPinDecorator.tsx", import: import("!!raw-loader!./MarkerPinDecorator") },
      { name: "PlaceMarkerTool.ts", import: import("!!raw-loader!./PlaceMarkerTool") },
      { name: "PopupMenu.tsx", import: import("!!raw-loader!./PopupMenu") },
    ],
    sampleClass: MarkerPinUI,
  });
}
