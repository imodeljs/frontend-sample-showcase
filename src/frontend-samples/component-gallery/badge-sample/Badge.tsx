/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "common/CommonComponentTools/ComponentContainer";
import { BetaBadge, NewBadge } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";
import { ControlPane } from "Components/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};
export default class BadgeList extends React.Component<{}> implements SampleApp {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getBadgeData(): ComponentExampleProps[] {
    return [
      createComponentExample("BetaBadge", undefined, <BetaBadge />),
      createComponentExample("NewBadge", undefined, <NewBadge />),
    ];
  }

  public static async setup(_iModelName: string) {
    return <BadgeList></BadgeList>;
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of badges that can be used in iModel.js applications."></ControlPane>
        <ComponentContainer data={BadgeList.getBadgeData()}></ComponentContainer>
      </>
    );
  }
}
