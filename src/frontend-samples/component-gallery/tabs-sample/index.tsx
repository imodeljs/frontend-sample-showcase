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

import { HorizontalTabs, VerticalTabs } from "@bentley/ui-core"



export function getTabsSpec(): SampleSpec {
  return ({
    name: "tabs-sample",
    label: "UI-Tabs",
    image: "ui-tabs-thumbnail.png",
    customModelList: [],

    setup: TabsList.setup ,
  });
}


export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
    return { title, description, content };
};



export class TabsList extends React.Component<{}> {

    public static getTabsData(): ComponentExampleProps[] {
        return [
            createComponentExample("Horizontal Tabs", undefined, <HorizontalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} activeIndex={0} />),
            createComponentExample("Green Horizontal Tabs", "with green prop", <HorizontalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} activeIndex={0} green />),
            createComponentExample("Vertical Tabs", undefined, <VerticalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} activeIndex={0} />),
            createComponentExample("Green Vertical Tabs", "with green prop", <VerticalTabs labels={["Tab 1", "Tab 2", "Tab 3"]} activeIndex={0} green />),
          ]
    }

    public static async setup() {
        return <TabsList></TabsList>
    }

    public getControlPlane() {
        return (
            <>
                <div className="sample-ui  component-ui">
                    <div className="sample-instructions">
                        <span>Different styles of tabs that can be used in iModel.js applications</span>
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
             <ComponentContainer data = {TabsList.getTabsData()}></ComponentContainer>
            </>
        );
    }
  
}