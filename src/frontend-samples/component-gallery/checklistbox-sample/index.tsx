/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { GithubLink } from "../../../Components/GithubLink";
import "../../../common/samples-common.scss";
import "../CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "../CommonComponentTools/ComponentContainer";
import { CheckListBox, CheckListBoxItem, CheckListBoxSeparator } from "@bentley/ui-core";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export class CheckListBoxList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getCheckListBoxData(): ComponentExampleProps[] {
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

  public static async setup() {
    return <CheckListBoxList></CheckListBoxList>;
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Different styles of checklistboxes that can be used in iModel.js applications</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/component-gallery/checklistbox-sample" />
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
        <ComponentContainer data={CheckListBoxList.getCheckListBoxData()}></ComponentContainer>
      </>
    );
  }

}