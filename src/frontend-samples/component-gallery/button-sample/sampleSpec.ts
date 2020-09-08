/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import ButtonList from "./Button";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getButtonSpec(): SampleSpec {
  return ({
    name: "button-sample",
    label: "UI-Buttons",
    image: "ui-button-thumbnail.png",
    customModelList: [],
    files: [
      { name: "Button.tsx", import: import("!!raw-loader!./Button"), entry: true },
    ],
    setup: ButtonList.setup.bind(ButtonList),
  });
}
