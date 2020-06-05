/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { GithubLink } from "../../../Components/GithubLink";
import "../../../common/samples-common.scss";
import "../CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "../CommonComponentTools/ComponentContainer";
import { ContextMenuItem, SplitButton } from "@bentley/ui-core";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getSplitButtonSpec(): SampleSpec {
  return ({
    name: "split-button-sample",
    label: "UI-Split Buttons",
    image: "ui-split-button-thumbnail.png",
    customModelList: [],

    setup: SplitButtonList.setup,
  });
}

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export class SplitButtonList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  private static get splitButtonMenuItems(): React.ReactNode[] {
    return [
      <ContextMenuItem key="item1" icon="icon-placeholder">Item 1</ContextMenuItem>,
      <ContextMenuItem key="item2" icon="icon-placeholder">Item 2</ContextMenuItem>,
      <ContextMenuItem key="item3" icon="icon-placeholder">Item 3</ContextMenuItem>,
    ];
  }
  public static getSplitButtonData(): ComponentExampleProps[] {
    return [
      createComponentExample("Basic SplitButton", "Basic SplitButton",
        <SplitButton label="Split Button" onClick={() => { }}>
          {this.splitButtonMenuItems.map((node) => node)}
        </SplitButton>),
      createComponentExample("SplitButton with border", "SplitButton with drawBorder prop",
        <SplitButton label="Split Button" drawBorder icon="icon-placeholder" onClick={() => { }}>
          {this.splitButtonMenuItems.map((node) => node)}
        </SplitButton>),
    ];
  }

  public static async setup() {
    return <SplitButtonList></SplitButtonList>;
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Different styles of split buttons that can be used in iModel.js applications</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/component-gallery/split-button-sample" />
          </div>
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
        <ComponentContainer data={SplitButtonList.getSplitButtonData()}></ComponentContainer>
      </>
    );
  }
}