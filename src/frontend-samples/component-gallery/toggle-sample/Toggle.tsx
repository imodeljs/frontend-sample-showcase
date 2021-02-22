/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { LabeledToggle, Toggle, ToggleButtonType } from "@bentley/ui-core";
import { ControlPane } from "common/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class ToggleList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getToggleData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Basic Toggle", undefined, <Toggle isOn={true} />),
      createComponentExample("Primary Toggle", "Toggle with buttonType={ToggleButtonType.Primary}", <Toggle isOn={true} buttonType={ToggleButtonType.Primary} />),
      createComponentExample("Large Toggle", "Toggle with large={true}", <Toggle isOn={true} large={true} />),
      createComponentExample("Square Toggle", "Toggle with rounded={false}", <Toggle isOn={true} rounded={false} />),
      createComponentExample("Toggle with Checkmark", "Toggle with showCheckmark prop", <Toggle isOn={true} showCheckmark={true} />),
      createComponentExample("LabeledToggle", undefined, <LabeledToggle isOn={true} label="Toggle label" />),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of toggles that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={ToggleList.getToggleData()}></UIComponentContainer>
      </>
    );
  }

}
