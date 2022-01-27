/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { HorizontalTabs, Tab, VerticalTabs } from "@itwin/itwinui-react";
import { SvgStar } from "@itwin/itwinui-icons-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class TabsList extends React.Component<{}>  {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getTabsData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Horizontal Tabs", undefined, <HorizontalTabs type={"default"} focusActivationMode="auto" labels={["Tab 1", "Tab 2", "Tab 3"]} />),
      createComponentExample("Green Horizontal Tabs", undefined, <HorizontalTabs color={"green"} focusActivationMode="auto" labels={["Tab 1", "Tab 2", "Tab 3"]} />),
      createComponentExample("Borderless Tabs", undefined, <HorizontalTabs type={"borderless"} focusActivationMode="auto" labels={["Tab 1", "Tab 2", "Tab 3"]} />),
      createComponentExample("Pill Tabs", undefined, <HorizontalTabs type={"pill"} focusActivationMode="auto" labels={[<Tab key="0" startIcon={<SvgStar />} />, <Tab key="1" startIcon={<SvgStar />} />, <Tab key="2" startIcon={<SvgStar />} />]} />),
      createComponentExample("Sublabel and Icon Tabs", undefined, <HorizontalTabs type={"borderless"} focusActivationMode="auto" labels={[<Tab key="0" label="Item0" startIcon={<SvgStar />} sublabel="Sublabel0" />, <Tab key="1" label="Item1" startIcon={<SvgStar />} sublabel="Sublabel1" />, <Tab key="2" disabled label="Item2" startIcon={<SvgStar />} sublabel="Sublabel2" />]} />),
      createComponentExample("Vertical Tabs", undefined, <VerticalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} />),
    ];
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
