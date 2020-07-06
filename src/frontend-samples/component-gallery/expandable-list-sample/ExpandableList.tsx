/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "common/CommonComponentTools/ComponentContainer";
import { ExpandableBlock, ExpandableList } from "@bentley/ui-core";
import { SampleExpandableBlock } from "./SampleExpandableBlock";
import SampleApp from "common/SampleApp";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export default class ExpandableListList extends React.Component<{}> implements SampleApp {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getExpandableListData(): ComponentExampleProps[] {
    return [
      createComponentExample("ExpandableList", "ExpandableList with one ExpandableBlock",
        <ExpandableList className="uicore-full-width">
          <SampleExpandableBlock title="Test" isExpanded={true} onClick={() => { }}>
            Hello World!
              </SampleExpandableBlock>
        </ExpandableList>),
      createComponentExample("ExpandableList w/ singleExpandOnly", "ExpandableList with singleExpandOnly prop",
        <ExpandableList className="uicore-full-width" singleExpandOnly={true} defaultActiveBlock={0}>
          <ExpandableBlock title="Test1" isExpanded={false} onClick={() => { }}>
            Hello World 1
              </ExpandableBlock>
          <ExpandableBlock title="Test2" isExpanded={false} onClick={() => { }}>
            Hello World 2
              </ExpandableBlock>
        </ExpandableList>),
    ];
  }

  public static async setup() {
    return <ExpandableListList></ExpandableListList>;
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Different styles of expandable lists that can be used in iModel.js applications</span>
          </div>
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
        <ComponentContainer data={ExpandableListList.getExpandableListData()}></ComponentContainer>
      </>
    );
  }

}
