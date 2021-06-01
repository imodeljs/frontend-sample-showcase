/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { SampleIModels } from "@itwinjs-sandbox/SampleIModels";
import { SampleSpec } from "SampleSpec";

export function getParticleSnowSampleSpec(): SampleSpec {
  return ({
    name: "snow-rain-sample",
    label: "Particle Effect (Snow & Rain)",
    image: "snow-decorator-thumbnail.png",
    iModelList: [SampleIModels.Villa, SampleIModels.House, SampleIModels.MetroStation, SampleIModels.BayTown, SampleIModels.Stadium],
    iTwinViewerReady: true,
    readme: async () => import("-!raw-loader!./README.md"),
    files: () => [
      { name: "SnowDecorationApi.tsx", import: import("-!raw-loader!./SnowDecorationApi"), entry: true },
      { name: "SnowDecorationApp.tsx", import: import("-!raw-loader!./SnowDecorationApp") },
      { name: "SnowDecorationWidget.tsx", import: import("-!raw-loader!./SnowDecorationWidget") },
      { name: "SnowDecorator.ts", import: import("-!raw-loader!./SnowDecorator") },
      { name: "SnowDecoration.scss", import: import("-!raw-loader!./SnowDecoration.scss") },
    ],
    type: "SnowDecorationApp.tsx",
  });
}
