/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { BlockText, BodyText, DisabledText, Headline, LeadingText, MutedText, SmallText, Subheading, Title } from "@bentley/ui-core";
import { ControlPane } from "common/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class TextList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getTextData(): UIComponentExampleProps[] {
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

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of text that can be used in iModel.js application."></ControlPane>
        <UIComponentContainer data={TextList.getTextData()}></UIComponentContainer>
      </>
    );
  }
}
