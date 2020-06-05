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
import { ComponentContainer, ComponentExampleProps } from "../CommonComponentTools/ComponentContainer";
import { BlockText, BodyText, DisabledText, Headline, LeadingText, MutedText, SmallText, Subheading, Title } from "@bentley/ui-core";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getTextSpec(): SampleSpec {
  return ({
    name: "text-sample",
    label: "UI-Text",
    image: "ui-text-thumbnail.png",
    customModelList: [],

    setup: TextList.setup,
  });
}

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};



export class TextList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
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
    ];
  }

  public static async setup() {
    return <TextList></TextList>;
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Different styles of text that can be used in iModel.js applications</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/component-gallery/text-sample" />
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
        <ComponentContainer data={TextList.getTextData()}></ComponentContainer>
      </>
    );
  }
}
