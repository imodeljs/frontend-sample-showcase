/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
// cSpell:ignore webfont
// cSpell:ignore Checkmark

import * as React from "react";
// import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../../Components/GithubLink";
import "../../../common/samples-common.scss";

import "../CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "../CommonComponentTools/ComponentContainer";

import { LabeledToggle, Toggle, ToggleButtonType } from "@bentley/ui-core";

export function getToggleSpec(): SampleSpec {
  return ({
    name: "toggle-sample",
    label: "Toggle",
    image: "viewport-only-thumbnail.png",
    setup: ToggleList.setup,
  }
  );
}

export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export class ToggleList extends React.Component<{}> {

  public static getToggleData(): ComponentExampleProps[] {
    return [
      createComponentExample("Basic Toggle", undefined, <Toggle isOn={true} />),
      createComponentExample("Primary Toggle", "Toggle with buttonType={ToggleButtonType.Primary}", <Toggle isOn={true} buttonType={ToggleButtonType.Primary} />),
      createComponentExample("Large Toggle", "Toggle with large={true}", <Toggle isOn={true} large={true} />),
      createComponentExample("Square Toggle", "Toggle with rounded={false}", <Toggle isOn={true} rounded={false} />),
      createComponentExample("Toggle with Checkmark", "Toggle with showCheckmark prop", <Toggle isOn={true} showCheckmark={true} />),
      createComponentExample("LabeledToggle", undefined, <LabeledToggle isOn={true} label="Toggle label" />),
    ];
  }

  public static async setup() {
    return (<ToggleList></ToggleList>);
  }

  public render() {
    return (
      <>
        <div className="sample-ui">
          <div>
            <span>Different Styles of Buttons</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
            <ComponentContainer data={ToggleList.getToggleData()}></ComponentContainer>
          </div>
        </div>
      </>
    );
  }
}
