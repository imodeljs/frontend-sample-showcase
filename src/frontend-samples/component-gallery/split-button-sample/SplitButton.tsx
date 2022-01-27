/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { MenuItem, SplitButton } from "@itwin/itwinui-react";
import { SvgPlaceholder } from "@itwin/itwinui-icons-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class SplitButtonList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer

  public static splitButtonMenuItems = () => {
    return [
      <MenuItem key="item1" icon={<SvgPlaceholder />}>Item 1</MenuItem>,
      <MenuItem key="item2" icon={<SvgPlaceholder />}>Item 2</MenuItem>,
      <MenuItem key="item3" icon={<SvgPlaceholder />}>Item 3</MenuItem>,
    ];
  };

  public static getSplitButtonData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Basic SplitButton", "Basic SplitButton",
        <SplitButton menuItems={this.splitButtonMenuItems} styleType={"borderless"} onClick={() => { }}>
          Default
        </SplitButton>),
      createComponentExample("SplitButton with border", "SplitButton with drawBorder prop",
        <SplitButton menuItems={this.splitButtonMenuItems} styleType={"default"} startIcon={<SvgPlaceholder />} onClick={() => { }}>
          Split Button
        </SplitButton>),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of split buttons that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={SplitButtonList.getSplitButtonData()}></UIComponentContainer>
      </>
    );
  }
}
