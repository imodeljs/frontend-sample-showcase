/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { SearchBox } from "@itwin/core-react";
import { ControlPane } from "common/ControlPane/ControlPane";
import { ThemeProvider } from "@itwin/itwinui-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class SearchBoxList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getSearchBoxData(): UIComponentExampleProps[] {
    return [
      createComponentExample("SearchBox", undefined,
        // eslint-disable-next-line no-console
        <SearchBox placeholder="Search" onValueChanged={(value: string) => console.log(`Search text: ${value}`)} />),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ThemeProvider theme={"dark"} />
        <ControlPane instructions="Different styles of search boxes that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={SearchBoxList.getSearchBoxData()}></UIComponentContainer>
      </>
    );
  }

}
