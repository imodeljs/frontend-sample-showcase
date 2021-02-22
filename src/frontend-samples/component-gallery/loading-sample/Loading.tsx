/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { LoadingPrompt, LoadingSpinner, LoadingStatus, Spinner, SpinnerSize } from "@bentley/ui-core";
import { ControlPane } from "common/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class LoadingList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getLoadingData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Small Spinner", undefined, <Spinner size={SpinnerSize.Small} />),
      createComponentExample("Medium Spinner", undefined, <Spinner size={SpinnerSize.Medium} />),
      createComponentExample("Large Spinner", undefined, <Spinner size={SpinnerSize.Large} />),
      createComponentExample("XLarge Spinner", undefined, <Spinner size={SpinnerSize.XLarge} />),
      createComponentExample("Small LoadingSpinner", undefined, <LoadingSpinner size={SpinnerSize.Small} message="This is a Small LoadingSpinner" />),
      createComponentExample("Medium LoadingSpinner", undefined, <LoadingSpinner size={SpinnerSize.Medium} message="This is a Medium LoadingSpinner" />),
      createComponentExample("Large LoadingSpinner", undefined, <LoadingSpinner size={SpinnerSize.Large} message="This is a Large LoadingSpinner" />),
      createComponentExample("XLarge LoadingSpinner", undefined, <LoadingSpinner size={SpinnerSize.XLarge} message="This is a XLarge LoadingSpinner" />),
      createComponentExample("LoadingStatus", undefined, <LoadingStatus message="Loading status..." percent={50} />),
      createComponentExample("Basic LoadingPrompt", undefined, <LoadingPrompt title="Title" />),
      createComponentExample("LoadingPrompt with message", undefined, <LoadingPrompt title="Title" message="This is the message" />),
      createComponentExample("Determinate LoadingPrompt", undefined, <LoadingPrompt title="Title" message="This is the message" isDeterminate={true} />),
      createComponentExample("Determinate LoadingPrompt with percent", undefined,
        <LoadingPrompt title="Title" message="This is the message" isDeterminate={true} percent={50} />),
      createComponentExample("Determinate LoadingPrompt with cancel", undefined,
        <LoadingPrompt title="Title" message="This is the message" isDeterminate={true} percent={50} showCancel={true} />),
      createComponentExample("Determinate LoadingPrompt with status", undefined,
        <LoadingPrompt title="Title" message="This is the message" isDeterminate={true} showStatus={true} percent={50} status="Updating..." />),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of loading icons that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={LoadingList.getLoadingData()}></UIComponentContainer>
      </>
    );
  }

}
