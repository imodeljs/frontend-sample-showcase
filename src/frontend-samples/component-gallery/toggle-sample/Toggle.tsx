/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "common/CommonComponentTools/ComponentContainer";
import { ControlPaneHeader } from "Components/ControlPaneHeader/ControlPaneHeader";
import { LabeledToggle, Toggle, ToggleButtonType } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export default class ToggleList extends React.Component<{}> implements SampleApp {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
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
    return <ToggleList></ToggleList>;
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <ControlPaneHeader instructions="Different styles of toggles that can be used in iModel.js applications."></ControlPaneHeader>
        </div>
      </>
    );
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        {this.getControlPane()}
        <ComponentContainer data={ToggleList.getToggleData()}></ComponentContainer>
      </>
    );
  }

}
