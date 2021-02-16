/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ContextMenuItem, SplitButton } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";
import { ControlPane } from "common/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class SplitButtonList extends React.Component<{}> implements SampleApp {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  private static get splitButtonMenuItems(): React.ReactNode[] {
    return [
      <ContextMenuItem key="item1" icon="icon-placeholder">Item 1</ContextMenuItem>,
      <ContextMenuItem key="item2" icon="icon-placeholder">Item 2</ContextMenuItem>,
      <ContextMenuItem key="item3" icon="icon-placeholder">Item 3</ContextMenuItem>,
    ];
  }
  public static getSplitButtonData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Basic SplitButton", "Basic SplitButton",
        <SplitButton label="Split Button" onClick={() => { }}>
          {this.splitButtonMenuItems.map((node) => node)}
        </SplitButton>),
      createComponentExample("SplitButton with border", "SplitButton with drawBorder prop",
        <SplitButton label="Split Button" drawBorder icon="icon-placeholder" onClick={() => { }}>
          {this.splitButtonMenuItems.map((node) => node)}
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
