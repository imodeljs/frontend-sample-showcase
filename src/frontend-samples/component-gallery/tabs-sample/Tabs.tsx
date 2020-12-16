/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { HorizontalTabs, VerticalTabs } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";
import { ControlPane } from "common/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class TabsList extends React.Component<{}> implements SampleApp {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getTabsData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Horizontal Tabs", undefined, <HorizontalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} activeIndex={0} />),
      createComponentExample("Green Horizontal Tabs", "with green prop", <HorizontalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} activeIndex={0} green />),
      createComponentExample("Vertical Tabs", undefined, <VerticalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} activeIndex={0} />),
      createComponentExample("Green Vertical Tabs", "with green prop", <VerticalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} activeIndex={0} green />),
    ];
  }

  public static async setup(_iModelName: string) {
    return <TabsList></TabsList>;
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of tabs that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={TabsList.getTabsData()}></UIComponentContainer>
      </>
    );
  }
}
