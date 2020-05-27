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

import { SampleIModels } from "../../../Components/IModelSelector/IModelSelector";
import { CheckListBox, CheckListBoxItem, CheckListBoxSeparator } from "@bentley/ui-core"



export function getCheckListBoxSpec(): SampleSpec {
  return ({
    name: "checklistbox-sample",
<<<<<<< HEAD
    label: "UI-CheckListBoxes",
    image: "viewport-only-thumbnail.png",
    customModelList: [],

    setup: CheckListBoxList.setup ,
    
=======
    label: "CheckListBox",
    image: "viewport-only-thumbnail.png",
    setup: CheckListBoxList.setup ,
>>>>>>> ae033e4822ddc188c3382966a775ffa54a36dcda
  });
}


export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
    return { title, description, content };
};



export class CheckListBoxList extends React.Component<{}> {

    public static getCheckListBoxData(): ComponentExampleProps[] {
        return [
            createComponentExample("CheckListBox", undefined,
              <CheckListBox>
                <CheckListBoxItem label="Item 1" />
                <CheckListBoxItem label="Item 2" />
              </CheckListBox>),
            createComponentExample("CheckListBox with separator", undefined,
              <CheckListBox>
                <CheckListBoxItem label="Item 1" />
                <CheckListBoxItem label="Item 2" />
                <CheckListBoxSeparator />
                <CheckListBoxItem label="Item 3" />
                <CheckListBoxItem label="Item 4" />
              </CheckListBox>),
          ]
    }

    public static async setup() {
        return <CheckListBoxList></CheckListBoxList>
    }

<<<<<<< HEAD
    public getControlPlane() {
      return (
          <>
              <div className="sample-ui  component-ui">
                  <div className="sample-instructions">
                      <span>Different styles of checklistboxes that can be used in iModel.js applications</span>
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
           <ComponentContainer data = {CheckListBoxList.getCheckListBoxData()}></ComponentContainer>
          </>
=======
    public render() {
        return (
            <>
            <div className="sample-ui">
                <div>
                <span>Different Styles of Buttons</span>
                <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
                    <ComponentContainer data = {CheckListBoxList.getCheckListBoxData()}></ComponentContainer>
                </div>
            </div>
            </>
>>>>>>> ae033e4822ddc188c3382966a775ffa54a36dcda
        );
    }
  
}