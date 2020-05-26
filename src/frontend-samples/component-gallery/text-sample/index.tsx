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
import { BodyText, BlockText, DisabledText, Headline, LeadingText, MutedText, SmallText, Subheading, Title } from "@bentley/ui-core"



export function getTextSpec(): SampleSpec {
  return ({
    name: "text-sample",
    label: "Text",
    image: "viewport-only-thumbnail.png",
    setup: TextList.setup ,
  });
}


export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
    return { title, description, content };
};



export class TextList extends React.Component<{}> {

    public static getTextData(): ComponentExampleProps[] {
        return [
            createComponentExample("BodyText", undefined, <BodyText>This is Body Text</BodyText>),
            createComponentExample("BlockText", undefined, <BlockText>This is Block Text</BlockText>),
            createComponentExample("DisabledText", undefined, <DisabledText>This is Disabled Text</DisabledText>),
            createComponentExample("Headline", undefined, <Headline>This is Headline Text</Headline>),
            createComponentExample("LeadingText", undefined, <LeadingText>This is Leading Text</LeadingText>),
            createComponentExample("MutedText", undefined, <MutedText>This is Muted Text</MutedText>),
            createComponentExample("SmallText", undefined, <SmallText>This is Small Text</SmallText>),
            createComponentExample("Subheading", undefined, <Subheading>This is Subheading Text</Subheading>),
            createComponentExample("Title", undefined, <Title>This is Title Text</Title>),
          ]
    }

    public static async setup() {
        return <TextList></TextList>
    }

    public render() {
        return (
            <>
            <div className="sample-ui">
                <div>
                <span>Different Styles of Buttons</span>
                <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
                    <ComponentContainer data = {TextList.getTextData()}></ComponentContainer>
                </div>
            </div>
            </>
        );
    }
  
}