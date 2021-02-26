/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ReactMarkerApp from "./ReactMarkerApp";

export function getMarkerPinSpec(): SampleSpec {
  return {
    name: "react-marker-sample",
    label: "React Markers",
    image: "react-marker-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      {
        name: "MarkerPinApp.tsx",
        import: import("!!raw-loader!./ReactMarkerApp.tsx"),
        entry: true,
      },
      {
        name: "MarkerPinUI.tsx",
        import: import("!!raw-loader!./ReactMarkerUI.tsx"),
      },
      { name: "Marker.tsx", import: import("!!raw-loader!./ReactMarker.tsx") },
      {
        name: "PlaceMarkerTool.ts",
        import: import("!!raw-loader!./ReactMarkerTools"),
      },
    ],
    setup: ReactMarkerApp.setup,
    teardown: ReactMarkerApp.teardown,
  };
}
