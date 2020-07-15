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
import { SearchBox } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export default class SearchBoxList extends React.Component<{}> implements SampleApp {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getSearchBoxData(): ComponentExampleProps[] {
    return [
      createComponentExample("SearchBox", undefined,
        // tslint:disable-next-line: no-console
        <SearchBox placeholder="Search" onValueChanged={(value: string) => console.log(`Search text: ${value}`)} />),
    ];
  }

  public static async setup() {
    return <SearchBoxList></SearchBoxList>;
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <ControlPaneHeader instructions="Different styles of search boxes that can be used in iModel.js applications."></ControlPaneHeader>
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
        <ComponentContainer data={SearchBoxList.getSearchBoxData()}></ComponentContainer>
      </>
    );
  }

}
