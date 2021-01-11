/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import ExplodeApp from "./ExplodeApp";

export function getExplodeSpec(): SampleSpec {
  return ({
    name: "explode-sample",
    label: "Explode",
    image: "viewport-only-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "ExplodeApp.tsx", import: import("!!raw-loader!./ExplodeApp"), entry: true },
      { name: "ExplodeUI.tsx", import: import("!!raw-loader!./ExplodeUI") },
    ],
    setup: ExplodeApp.setup.bind(ExplodeApp),
  });
}
