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

import { SearchBox } from "@bentley/ui-core"



export function getSearchBoxSpec(): SampleSpec {
  return ({
    name: "search-box-sample",
    label: "UI-Search Boxes",
    image: "ui-search-boxes-thumbnail.png",
    customModelList: [],

    setup: SearchBoxList.setup ,
  });
}


export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
    return { title, description, content };
};



export class SearchBoxList extends React.Component<{}> {

    public static getSearchBoxData(): ComponentExampleProps[] {
        return [
            createComponentExample("SearchBox", undefined,
              // tslint:disable-next-line: no-console
              <SearchBox placeholder="Search" onValueChanged={(value: string) => console.log(`Search text: ${value}`)} />),
          ]
    }

    public static async setup() {
        return <SearchBoxList></SearchBoxList>
    }

    public getControlPlane() {
        return (
            <>
                <div className="sample-ui  component-ui">
                    <div className="sample-instructions">
                        <span>Different styles of search boxes that can be used in iModel.js applications</span>
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
             <ComponentContainer data = {SearchBoxList.getSearchBoxData()}></ComponentContainer>
            </>
        );
    }
  
}