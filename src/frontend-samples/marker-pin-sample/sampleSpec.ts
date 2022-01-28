/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { getViewportOnlySpec } from "frontend-samples/viewport-only-sample/sampleSpec";
import { SampleSpec } from "SampleSpec";

export function getMarkerPinSpec(): SampleSpec {
  return ({
    name: "marker-pin-sample",
    label: "Marker Pins",
    image: "marker-pin-thumbnail.png",
    walkthrough: () => ({
      annotations: import("!walkthrough-loader!./walkthru.md"),
      prerequisites: [
        getViewportOnlySpec(),
      ],
    }),
    description: "Uses a #Decorator and a #MarkerSet to display #markers that indicate important locations in a model.",
    readme: async () => import("!!raw-loader!./readme.md"),
    files: () => [
      import("!editor-file-loader!./MarkerPinApi.ts"),
      import("!editor-file-loader!./MarkerPinWidget.tsx"),
      import("!editor-file-loader!./MarkerPinApp.tsx?entry=true"),
      import("!editor-file-loader!./MarkerPinDecorator"),
      import("!editor-file-loader!./MarkerPin.scss"),
      import("!editor-file-loader!./PlaceMarkerTool"),
      import("!editor-file-loader!./PopupMenu"),
    ],
    type: "MarkerPinApp.tsx",
  });
}
