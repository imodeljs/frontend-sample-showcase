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
import { UnderlinedButton } from "@bentley/ui-core";
import { SampleContextMenu } from "./SampleContextMenu";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getContextMenuSpec(): SampleSpec {
  return ({
    name: "context-menu-sample",
    label: "UI-Context Menus",
    image: "ui-context-menu-thumbnail.png",
    customModelList: [],

    setup: ContextMenuList.setup,
  });
}

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export class ContextMenuList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getContextMenuData(): ComponentExampleProps[] {
    return [
      createComponentExample("ContextMenu", undefined, <UnderlinedButton onClick={() => SampleContextMenu.showContextMenu()}> Open ContextMenu</UnderlinedButton>),
    ];
  }

  public static async setup() {
    return <ContextMenuList></ContextMenuList>;
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Different styles of context menus that can be used in iModel.js applications</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/component-gallery/context-menu-sample" />
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
        <ComponentContainer data={ContextMenuList.getContextMenuData()}></ComponentContainer>
      </>
    );
  }
}
