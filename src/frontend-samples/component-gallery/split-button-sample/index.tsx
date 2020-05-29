/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../../Components/GithubLink";
import "../../../common/samples-common.scss";

import "../CommonComponentTools/index.scss";
import {ComponentContainer, ComponentExampleProps} from "../CommonComponentTools/ComponentContainer";

import { SplitButton, ContextMenuItem } from "@bentley/ui-core"



export function getSplitButtonSpec(): SampleSpec {
  return ({
    name: "split-button-sample",
    label: "UI-Split Buttons",
    image: "ui-split-button-thumbnail.png",
    customModelList: [],

    setup: SplitButtonList.setup ,
  });
}


export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
    return { title, description, content };
};



export class SplitButtonList extends React.Component<{}> {

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
          ]
    }

    public static async setup() {
        return <SplitButtonList></SplitButtonList>
    }

    public getControlPlane() {
      return (
          <>
              <div className="sample-ui  component-ui">
                  <div className="sample-instructions">
                      <span>Different styles of split buttons that can be used in iModel.js applications</span>
                      <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
                  </div>
              </div>
          </>
      )
  }

    public render() {
        return (
          <>
          {this.getControlPlane()}
           <ComponentContainer data = {SplitButtonList.getSplitButtonData()}></ComponentContainer>
          </>
        );
    }
  
}