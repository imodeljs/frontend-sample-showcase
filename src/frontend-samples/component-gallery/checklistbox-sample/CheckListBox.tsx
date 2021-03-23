/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { CheckListBox, CheckListBoxItem, CheckListBoxSeparator } from "@bentley/ui-core";
import { ControlPane } from "common/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class CheckListBoxList extends React.Component<{}>  {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getCheckListBoxData(): UIComponentExampleProps[] {
    return [
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
        <ControlPane instructions="Different styles of checklistboxes that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={CheckListBoxList.getCheckListBoxData()}></UIComponentContainer>
      </>
    );
  }

}
