/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { Button, ButtonSize, ButtonType, UnderlinedButton } from "@itwin/core-react";
import { ControlPane } from "common/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class ButtonList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getButtonData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Basic Button", "Primary Button", <Button>Primary Button</Button>),
      createComponentExample("Disabled Button", "Button with disabled prop", <Button disabled>Disabled Button</Button>),
      createComponentExample("Blue Button", "Button with ButtonType.Blue", <Button buttonType={ButtonType.Blue}>Blue Button</Button>),
      createComponentExample("Hollow Button", "Button with ButtonType.Hollow", <Button buttonType={ButtonType.Hollow}>Hollow Button</Button>),
      createComponentExample("Large Basic Button", "Primary Button with size={ButtonSize.Large}", <Button size={ButtonSize.Large}>Primary Button</Button>),
      createComponentExample("Large Disabled Button", "Button with disabled and size={ButtonSize.Large} props", <Button disabled size={ButtonSize.Large}>Disabled Button</Button>),
      createComponentExample("Large Blue Button", "Button with ButtonType.Blue and size={ButtonSize.Large}", <Button buttonType={ButtonType.Blue} size={ButtonSize.Large}>Blue Button</Button>),
      createComponentExample("Large Hollow Button", "Button with ButtonType.Hollow and size={ButtonSize.Large}", <Button buttonType={ButtonType.Hollow} size={ButtonSize.Large}>Hollow Button</Button>),
      createComponentExample("Underlined Button", "UnderlinedButton component", <UnderlinedButton>Underlined Button</UnderlinedButton>),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of buttons that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={ButtonList.getButtonData()}></UIComponentContainer>
      </>
    );
  }
}
