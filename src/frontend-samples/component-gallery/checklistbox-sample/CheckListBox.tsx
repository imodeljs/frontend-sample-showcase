/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { CheckListBox, CheckListBoxItem, CheckListBoxSeparator } from "@itwin/core-react";
import { ControlPane } from "common/ControlPane/ControlPane";
import { Checkbox, InputGroup, ThemeProvider } from "@itwin/itwinui-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class CheckListBoxList extends React.Component<{}>  {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getCheckListBoxData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Default Checkbox", undefined, <Checkbox label="Basic Checkbox" />),
      createComponentExample("Disabled Checkbox", undefined, <Checkbox disabled label="Disabled Checkbox" />),
      createComponentExample("Indeterminate Checkbox", undefined, <Checkbox indeterminate label="Indeterminate Checkbox" />),
      createComponentExample("Postive Checkbox", undefined, <Checkbox status={"positive"} label="Postive Checkbox" />),
      createComponentExample("Warning Checkbox", undefined, <Checkbox status={"warning"} label="Warning Checkbox" />),
      createComponentExample("Negative Checkbox", undefined, <Checkbox status={"negative"} label="Negative Checkbox" />),
      createComponentExample("Loading Checkbox", undefined, <Checkbox isLoading label="Loading Checkbox" />),
      createComponentExample("Visibility Checkbox", undefined, <Checkbox variant={"eyeball"} label="Visibility Checkbox" />),
      createComponentExample("Checkbox Group", undefined,
        <InputGroup
          displayStyle="default"
          label="Select your hobbies"
          message="Choose some hobbies"
        >
          <Checkbox
            indeterminate
            onChange={function noRefCheck() { }}
          />
          <Checkbox
            label="Football"
            onChange={function noRefCheck() { }}
          />
          <Checkbox
            label="Hockey"
            onChange={function noRefCheck() { }}
          />
        </InputGroup>),
      createComponentExample("CheckListBox", undefined,
        <CheckListBox>
          <CheckListBoxItem label="Item 1" />
          <CheckListBoxItem label="Item 2" />
        </CheckListBox>),
      createComponentExample("CheckListBox with separator", undefined,
        <CheckListBox>
          <CheckListBoxItem label="Item 1" />
          <CheckListBoxItem label="Item 2" />
          <CheckListBoxSeparator />
          <CheckListBoxItem label="Item 3" />
          <CheckListBoxItem label="Item 4" />
        </CheckListBox>),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ThemeProvider theme={"dark"} />
        <ControlPane instructions="Different styles of checkboxes that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={CheckListBoxList.getCheckListBoxData()}></UIComponentContainer>
      </>
    );
  }

}
