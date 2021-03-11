/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import HtmlMarkerUI from "./HtmlMarkerUI";

export function getHtmlMarkerSpec(): SampleSpec {
  return {
    name: "html-marker-sample",
    label: "HTML Markers",
    image: "html-markers-thumbnail.png",
    readme: { name: "README.md", import: import("!!raw-loader!./README.md") },
    files: [
      {
        name: "HtmlMarkerUI.tsx",
        import: import("!!raw-loader!./HtmlMarkerUI.tsx"),
        entry: true,
      },
      {
        name: "HtmlMarker.tsx",
        import: import("!!raw-loader!./HtmlMarker.tsx"),
      },
      {
        name: "HtmlMarkerTools.tsx",
        import: import("!!raw-loader!./HtmlMarkerTools.tsx"),
      },
      {
        name: "HtmlMarker.scss",
        import: import("!!raw-loader!./HtmlMarker.scss"),
      },
      {
        name: "utils.ts",
        import: import("!!raw-loader!./utils"),
      },
    ],
    sampleClass: HtmlMarkerUI,
  };
}
