/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import AnimatedCameraApp from "./AnimatedCameraApp";
// import * as data from './Coordinates.json';
// const langFile = require('./Coordinates.json');

export function getViewCameraSpec(): SampleSpec {


  return ({
    name: "Animated Camera Path Sample",
    label: "Animated Camera",
    image: "view-attributes-thumbnail.png",
    readme: { name: "readme.md", import: import("!!raw-loader!./readme.md") },
    files: [
      { name: "AnimatedCameraApp.tsx", import: import("!!raw-loader!./AnimatedCameraApp"), entry: true },
      { name: "AnimatedCameraUI.tsx", import: import("!!raw-loader!./AnimatedCameraUI") },
      { name: "Coordinates.ts", import: import("!!raw-loader!./Coordinates.ts") },

    ],
    setup: AnimatedCameraApp.setup.bind(AnimatedCameraApp),
  });
}
