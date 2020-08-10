/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "common/CommonComponentTools/ComponentContainer";
import { Button, ButtonSize, ButtonType, UnderlinedButton } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export default class ButtonList extends React.Component<{ setupControlPane: (instructions: string, controls?: React.ReactNode) => void }> implements SampleApp {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getButtonData(): ComponentExampleProps[] {
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

  public static async setup(_iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void) {
    return <ButtonList setupControlPane={setupControlPane}></ButtonList>;
  }

  public componentDidMount() {
    this.props.setupControlPane("Different styles of buttons that can be used in iModel.js applications.");
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ComponentContainer data={ButtonList.getButtonData()}></ComponentContainer>
      </>
    );
  }
}
