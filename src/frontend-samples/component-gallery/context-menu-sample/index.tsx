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
import { UnderlinedButton } from "@bentley/ui-core"
import { SampleContextMenu } from "./SampleContextMenu";



export function getContextMenuSpec(): SampleSpec {
  return ({
    name: "context-menu-sample",
<<<<<<< HEAD
    label: "UI-Context Menus",
    image: "viewport-only-thumbnail.png",
    customModelList: [],

=======
    label: "ContextMenu",
    image: "viewport-only-thumbnail.png",
>>>>>>> ae033e4822ddc188c3382966a775ffa54a36dcda
    setup: ContextMenuList.setup ,
  });
}


export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
    return { title, description, content };
};



export class ContextMenuList extends React.Component<{}> {

    public static getContextMenuData(): ComponentExampleProps[] {
        return [
            createComponentExample("ContextMenu", undefined, <UnderlinedButton onClick={() => SampleContextMenu.showContextMenu()}> Open ContextMenu</UnderlinedButton>),
          ]
    }

    public static async setup() {
        return <ContextMenuList></ContextMenuList>
    }

<<<<<<< HEAD
    public getControlPlane() {
        return (
            <>
                <div className="sample-ui  component-ui">
                    <div className="sample-instructions">
                        <span>Different styles of context menus that can be used in iModel.js applications</span>
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
             <ComponentContainer data = {ContextMenuList.getContextMenuData()}></ComponentContainer>
=======
    public render() {
        return (
            <>
            <div className="sample-ui">
                <div>
                <span>Different Styles of Buttons</span>
                <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
                    <ComponentContainer data = {ContextMenuList.getContextMenuData()}></ComponentContainer>
                </div>
            </div>
>>>>>>> ae033e4822ddc188c3382966a775ffa54a36dcda
            </>
        );
    }
  
}