/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwin/sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getParticleSnowSampleSpec(): SampleSpec {
  return ({
    name: "snow-rain-sample",
    label: "Particle Effect (Snow & Rain)",
    image: "snow-decorator-thumbnail.png",
    iModelList: [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium],
    description: "Creates a #snow #overlay using #particles #Decorator.",
    readme: async () => import("!!raw-loader!./README.md"),
    files: () => [
      import("!editor-file-loader!./SnowDecorationApi?entry=true"),
      import("!editor-file-loader!./SnowDecorationApp"),
      import("!editor-file-loader!./SnowDecorationWidget"),
      import("!editor-file-loader!./SnowDecorator"),
      import("!editor-file-loader!./SnowDecoration.scss"),
      import("!editor-file-loader!./public/particle_rain(-22.5).png?public=true"),
      import("!editor-file-loader!./public/particle_rain(-45).png?public=true"),
      import("!editor-file-loader!./public/particle_rain(0).png?public=true"),
      import("!editor-file-loader!./public/particle_rain(22.5).png?public=true"),
      import("!editor-file-loader!./public/particle_rain(45).png?public=true"),
      import("!editor-file-loader!./public/particle_rain2.png?public=true"),
      import("!editor-file-loader!./public/particle_snow.png?public=true"),
    ],
    type: "SnowDecorationApp.tsx",
  });
}
