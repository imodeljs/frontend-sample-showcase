/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { Badge } from "@itwin/itwinui-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};
export default class BadgeList extends React.Component<{}> {
  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getBadgeData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Basic Badge", undefined, <Badge>Basic Badge</Badge>),
      createComponentExample("Long Label Badge", undefined, <Badge>Long label that gets truncated</Badge>),
      createComponentExample("Success Badge", undefined, <Badge backgroundColor='positive'>Success</Badge>),
      createComponentExample("Error Badge", undefined, <Badge backgroundColor='negative'>Error</Badge>),
      createComponentExample("Informational Badge", undefined, <Badge backgroundColor='primary'>Informational</Badge>),
      createComponentExample("Warning Badge", undefined, <Badge backgroundColor='warning'>Warning</Badge>),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of badges that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={BadgeList.getBadgeData()}></UIComponentContainer>
      </>
    );
  }
}
