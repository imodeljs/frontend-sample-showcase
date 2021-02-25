/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import MarkerPinApp from "./MarkerPinApp";

export function getMarkerPinSpec(): SampleSpec {
  return {
    name: "jsx-marker-sample",
    label: "JSX Markers",
    image: "jsx-marker-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      {
        name: "MarkerPinApp.tsx",
        import: import("!!raw-loader!./MarkerPinApp.tsx"),
        entry: true,
      },
      {
        name: "MarkerPinUI.tsx",
        import: import("!!raw-loader!./MarkerPinUI.tsx"),
      },
      { name: "Marker.tsx", import: import("!!raw-loader!./Marker.tsx") },
      {
        name: "PlaceMarkerTool.ts",
        import: import("!!raw-loader!./PlaceMarkerTool"),
      },
      { name: "PopupMenu.tsx", import: import("!!raw-loader!./PopupMenu") },
    ],
    setup: MarkerPinApp.setup,
    teardown: MarkerPinApp.teardown,
  };
}
