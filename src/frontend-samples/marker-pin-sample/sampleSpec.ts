/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import MarkerPinApp from "./MarkerPinApp";

export function getMarkerPinSpec(): SampleSpec {
  return ({
    name: "marker-pin-sample",
    label: "Marker Pins",
    image: "marker-pin-thumbnail.png",
    files: [
      { name: "MarkerPinApp.tsx", import: import("!!raw-loader!./MarkerPinApp.tsx"), entry: true },
      { name: "MarkerPinUI.tsx", import: import("!!raw-loader!./MarkerPinUI.tsx") },
      { name: "MarkerPinDecorator.tsx", import: import("!!raw-loader!./MarkerPinDecorator") },
      { name: "PlaceMarkerTool.ts", import: import("!!raw-loader!./PlaceMarkerTool") },
      { name: "PopupMenu.tsx", import: import("!!raw-loader!./PopupMenu") },
    ],
    setup: MarkerPinApp.setup.bind(MarkerPinApp),
    teardown: MarkerPinApp.teardown.bind(MarkerPinApp),
  });
}
