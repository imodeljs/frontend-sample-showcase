/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "common/CommonComponentTools/ComponentContainer";
import { SearchBox } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";
import { ControlPane } from "Components/ControlPane/ControlPane";

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

  public static async setup(_iModelName: string) {
    return <SearchBoxList></SearchBoxList>;
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of search boxes that can be used in iModel.js applications."></ControlPane>
        <ComponentContainer data={SearchBoxList.getSearchBoxData()}></ComponentContainer>
      </>
    );
  }

}
