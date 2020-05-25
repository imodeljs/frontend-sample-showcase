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
    label: "CheckListBox",
    image: "viewport-only-thumbnail.png",
    modelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House],
    setup: CheckListBoxList.setup ,
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
        );
    }
  
}