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
import { SearchBox } from "@bentley/ui-core"



export function getSearchBoxSpec(): SampleSpec {
  return ({
    name: "search-box-sample",
<<<<<<< HEAD
    label: "UI-Search Boxes",
    image: "viewport-only-thumbnail.png",
    customModelList: [],

=======
    label: "SearchBox",
    image: "viewport-only-thumbnail.png",
>>>>>>> ae033e4822ddc188c3382966a775ffa54a36dcda
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

<<<<<<< HEAD
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
=======
    public render() {
        return (
            <>
            <div className="sample-ui">
                <div>
                <span>Different Styles of Buttons</span>
                <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
                    <ComponentContainer data = {SearchBoxList.getSearchBoxData()}></ComponentContainer>
                </div>
            </div>
>>>>>>> ae033e4822ddc188c3382966a775ffa54a36dcda
            </>
        );
    }
  
}