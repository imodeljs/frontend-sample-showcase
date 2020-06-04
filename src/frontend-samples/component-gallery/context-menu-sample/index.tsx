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
import { UnderlinedButton } from "@bentley/ui-core"
import { SampleContextMenu } from "./SampleContextMenu";

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

    public render() {
        return (
            <>
                <div className="sample-ui">
                    <div>
                        <span>Different Styles of Buttons</span>
                        <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
                        <ComponentContainer data={ContextMenuList.getContextMenuData()}></ComponentContainer>
                    </div>
                </div>
            </>
        );
    }

}