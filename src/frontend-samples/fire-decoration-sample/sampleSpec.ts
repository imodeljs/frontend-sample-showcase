/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getParticleFireSampleSpec(): SampleSpec {
  return ({
    name: "fire-sample",
    label: "Particle Effect (Fire)",
    image: "fire-decorator-thumbnail.png",
    description: "Creates an #fire effect using #particles #Decorator.",
    iTwinViewerReady: true,
    iModelList: [SampleIModels.Villa, SampleIModels.BayTown, SampleIModels.House],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./FireDecorationApi"),
      import("!editor-file-loader!./FireDecorationApp?entry=true"),
      import("!editor-file-loader!./FireDecorationWidget"),
      import("!editor-file-loader!./FireDecorator"),
      import("!editor-file-loader!./PlacementTool"),
      import("!editor-file-loader!./FireDecoration.scss"),
    ],
    type: "FireDecorationApp.tsx",
  });
}
