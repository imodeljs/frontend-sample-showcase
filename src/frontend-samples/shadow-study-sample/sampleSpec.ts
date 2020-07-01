/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "Components/SampleShowcase/SampleShowcase";
import ShadowStudyApp from "./ShadowStudyApp";

export function getShadowStudySpec(): SampleSpec {
  return ({
    name: "shadow-study-sample",
    label: "Shadow Study",
    image: "shadow-study-thumbnail.png",
    files: [
      { name: "ShadowStudyApp.tsx", import: import("!!raw-loader!./ShadowStudyApp"), entry: true },
    ],
    setup: ShadowStudyApp.setup,
  });
}
