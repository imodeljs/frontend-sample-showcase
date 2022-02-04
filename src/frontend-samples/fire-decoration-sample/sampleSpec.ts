/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getParticleFireSampleSpec(): SampleSpec {
  return ({
    name: "fire-sample",
    label: "Particle Effect (Fire)",
    image: "fire-decorator-thumbnail.png",
    description: "Creates an #fire effect using #particles #Decorator.",
    iModelList: [SampleIModels.Villa, SampleIModels.BayTown, SampleIModels.House],
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./FireDecorationApi"),
      import("!editor-file-loader!./FireDecorationApp?entry=true"),
      import("!editor-file-loader!./FireDecorationWidget"),
      import("!editor-file-loader!./FireDecorator"),
      import("!editor-file-loader!./PlacementTool"),
      import("!editor-file-loader!./FireDecoration.scss"),
      import("!editor-file-loader!./public/particle-gradient-flame.png?public=true"),
      import("!editor-file-loader!./public/particle-gradient-smoke.png?public=true"),
    ],
    type: "FireDecorationApp.tsx",
  });
}
