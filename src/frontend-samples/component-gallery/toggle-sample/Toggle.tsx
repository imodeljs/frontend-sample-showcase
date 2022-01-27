/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { ToggleSwitch } from "@itwin/itwinui-react";
import { SvgCheckmark } from "@itwin/itwinui-icons-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class ToggleList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getToggleData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Default ToggleSwitch", undefined, <ToggleSwitch defaultChecked />),
      createComponentExample("Disabled Checked ToggleSwitch", undefined, <ToggleSwitch defaultChecked disabled />),
      createComponentExample("Disabled Unchecked ToggleSwitch", undefined, <ToggleSwitch disabled />),
      createComponentExample("Right Labeled ToggleSwitch", undefined, <ToggleSwitch defaultChecked label="This is a right label" labelPosition="right" />),
      createComponentExample("Left Labeled ToggleSwitch", undefined, <ToggleSwitch label="This is a left label" labelPosition="left" />),
      createComponentExample("ToggleSwitch with Icon", undefined, <ToggleSwitch defaultChecked icon={<SvgCheckmark />} />),
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
