/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ExpandableList } from "@itwin/core-react";
import { ControlPane } from "common/ControlPane/ControlPane";
import { ExpandableBlock, ThemeProvider } from "@itwin/itwinui-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class ExpandableListList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getExpandableListData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Basic Expandable Block", undefined,
        <ExpandableBlock
          onToggle={function noRefCheck() { }}
          title="Basic Block"
        >
          Content in block!
        </ExpandableBlock>),
      createComponentExample("Small Expandable Block", undefined,
        <ExpandableBlock
          onToggle={function noRefCheck() { }}
          size={"small"}
          title="Small Block"
        >
          Content in block!
        </ExpandableBlock>),
      createComponentExample("Status Block", undefined,
        <ExpandableBlock
          onToggle={function noRefCheck() { }}
          status="positive"
          title="Status Block"
        >
          Content in block!
        </ExpandableBlock>),
      createComponentExample("Caption Block", undefined,
        <ExpandableBlock
          onToggle={function noRefCheck() { }}
          caption="Block Caption"
          title="Caption Block"
        >
          Content in block!
        </ExpandableBlock>),
      createComponentExample("ExpandableList", "ExpandableList with one ExpandableBlock",
        <ExpandableList className="uicore-full-width">
          <ExpandableBlock title="Test" isExpanded={true} onToggle={() => { }}>
            Hello World!
          </ExpandableBlock>
        </ExpandableList>),
      createComponentExample("ExpandableList w/ singleExpandOnly", "ExpandableList with singleExpandOnly prop",
        <ExpandableList className="uicore-full-width" singleExpandOnly={true} defaultActiveBlock={0}>
          <ExpandableBlock title="Test1" isExpanded={false} onToggle={() => { }}>
            Hello World 1
          </ExpandableBlock>
          <ExpandableBlock title="Test2" isExpanded={false} onToggle={() => { }}>
            Hello World 2
          </ExpandableBlock>
        </ExpandableList>),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ThemeProvider theme={"dark"} />
        <ControlPane instructions="Different styles of expandable lists that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={ExpandableListList.getExpandableListData()}></UIComponentContainer>
      </>
    );
  }

}
