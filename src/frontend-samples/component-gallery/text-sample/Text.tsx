/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { Anchor, Blockquote, Body, Code, Headline, Kbd, Label, Leading, Small, Subheading, Text, Title } from "@itwin/itwinui-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class TextList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getTextData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Anchor", undefined, <Anchor href="https://www.example.com/">www.example.com</Anchor>),
      createComponentExample("Blockquote", undefined, <Blockquote cite="">This is a quote</Blockquote>),
      createComponentExample("Blockquote with Footer", undefined, <Blockquote
        cite="https://www.bentley.com/en"
        footer={<>— Greg Bentley,{" "}<cite>NasdaqListed</cite></>}
      >
        <p>
          For 36 years we have served engineers with our software, passionately believing that better performing and more resilient infrastructure is essential to improve the quality of life for people everywhere, sustain our environment, and grow our economies.
        </p>
      </Blockquote>),
      createComponentExample("Body", undefined, <Body>I&apos;m a Body</Body>),
      createComponentExample("Muted Body", undefined, <Body isMuted>I&apos;m a Body</Body>),
      createComponentExample("Skeleton Body", undefined, <Body isSkeleton>I&apos;m a Body</Body>),
      createComponentExample("Code Segment", undefined, <p>
        The {" "}
        <Code>
          push()
        </Code>
        {" "}method adds one or more elements to the end of an array and returns the new length of the array.
      </p>),
      createComponentExample("Headline", undefined, <Headline>I&apos;m a Headline</Headline>),
      createComponentExample("Keyboard Key", undefined, <Kbd>A</Kbd>),
      createComponentExample("Predefined Keyboard Key", undefined, <Kbd>↵ Enter</Kbd>),
      createComponentExample("Label", undefined, <div
        style={{
          maxWidth: "clamp(300px, 50%, 100%)",
        }}
      >
        <Label>Name</Label>
      </div>),
      createComponentExample("Inline Label", undefined, <div
        style={{
          maxWidth: "clamp(300px, 50%, 100%)",
        }}
      >
        <Label displayStyle={"inline"} required>Name</Label>
      </div>),
      createComponentExample("Leading", undefined, <Leading>I&apos;m a Leading</Leading>),
      createComponentExample("Muted Leading", undefined, <Leading isMuted>I&apos;m a Leading</Leading>),
      createComponentExample("Small", undefined, <Small>I&apos;m a Small</Small>),
      createComponentExample("Muted Small", undefined, <Small isMuted>I&apos;m a Small</Small>),
      createComponentExample("Subheading", undefined, <Subheading>I&apos;m a Subheading</Subheading>),
      createComponentExample("Muted Subheading", undefined, <Subheading isMuted>I&apos;m a Subheading</Subheading>),
      createComponentExample("Text", undefined, <Text as="div">I&apos;m a Text</Text>),
      createComponentExample("Polymorphic Text", undefined, <Text as="h4" variant="headline">I&apos;m a headline text rendered as an h4 element!</Text>),
      createComponentExample("Skeleton Text", undefined, <Text isSkeleton as="div">I&apos;m a Text</Text>),

      createComponentExample("Title", undefined, <Title>I&apos;m a Title</Title>),
      createComponentExample("Muted Title", undefined, <Title isMuted>I&apos;m a Title</Title>),
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
