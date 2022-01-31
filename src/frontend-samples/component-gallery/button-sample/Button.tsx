/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { UnderlinedButton } from "@itwin/core-react";
import { ControlPane } from "common/ControlPane/ControlPane";
import { Button, ThemeProvider } from "@itwin/itwinui-react";
import { SvgAdd } from "@itwin/itwinui-icons-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class ButtonList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getButtonData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Call to Action Button", "Button to prompt user input", <Button as="button" styleType="cta">Call To Action Button</Button>),
      createComponentExample("High Visibility Button", "Button to get attention", <Button as="button" styleType="high-visibility">High Visibility Button</Button>),
      createComponentExample("Default Button", "Button for general use", <Button as="button" styleType="default">Default Button</Button>),
      createComponentExample("Button with Icon", "Button that displays an icon", <Button as="button" startIcon={<SvgAdd />} styleType="high-visibility">New</Button>),
      createComponentExample("Button as Link", "Button that acts as a link", <Button as="a" href="https://itwin.github.io/iTwinUI-react/iframe.html?id=buttons-button--high-visibility&viewMode=docs" startIcon={<svg aria-hidden viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg"><path d="m16 0v5.4l-1.9-2-8.4 8.4-1.5-1.5 8.3-8.4-1.9-1.9m5.4 16v-9h-1v8h-14v-14h8v-1h-9v16z" /></svg>} styleType="default">Open in new tab</Button>),
      createComponentExample("Underlined Button", "UnderlinedButton component", <UnderlinedButton>Underlined Button</UnderlinedButton>),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ThemeProvider theme={"dark"} />
        <ControlPane instructions="Different styles of buttons that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={ButtonList.getButtonData()}></UIComponentContainer>
      </>
    );
  }
}
