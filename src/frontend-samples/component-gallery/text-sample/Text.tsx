/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "common/CommonComponentTools/ComponentContainer";
import { BlockText, BodyText, DisabledText, Headline, LeadingText, MutedText, SmallText, Subheading, Title } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";
import { ControlPane } from "Components/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export default class TextList extends React.Component<{}> implements SampleApp {

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

  public static async setup(_iModelName: string) {
    return <TextList></TextList>;
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of text that can be used in iModel.js application."></ControlPane>
        <ComponentContainer data={TextList.getTextData()}></ComponentContainer>
      </>
    );
  }
}
