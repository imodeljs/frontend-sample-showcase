/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ReactMarkerApp from "./ReactMarkerApp";

export function getReactMarkerSpec(): SampleSpec {
  return {
    name: "react-marker-sample",
    label: "React Markers",
    image: "marker-pin-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      {
        name: "ReactMarkerApp.tsx",
        import: import("!!raw-loader!./ReactMarkerApp.tsx"),
        entry: true,
      },
      {
        name: "ReactMarkerUI.tsx",
        import: import("!!raw-loader!./ReactMarkerUI.tsx"),
      },
      {
        name: "ReactMarker.tsx",
        import: import("!!raw-loader!./ReactMarker.tsx"),
      },
      {
        name: "ReactMarkerTools.tsx",
        import: import("!!raw-loader!./ReactMarkerTools.tsx"),
      },
      {
        name: "ReactMarker.module.scss",
        import: import("!!raw-loader!./ReactMarker.module.scss"),
      },
    ],
    setup: ReactMarkerApp.setup,
    teardown: ReactMarkerApp.teardown,
  };
}
