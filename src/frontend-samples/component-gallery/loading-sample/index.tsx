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
import { LoadingPrompt, LoadingSpinner, LoadingStatus, Spinner, SpinnerSize } from "@bentley/ui-core";

// Provides the information about the sample, passing no iModels since this sample does not utilize any
export function getLoadingSpec(): SampleSpec {
  return ({
    name: "loading-sample",
    label: "UI-Loading Icons",
    image: "ui-loading-thumbnail.png",
    customModelList: [],

    setup: LoadingList.setup,
  });
}

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};



export class LoadingList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getLoadingData(): ComponentExampleProps[] {
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
    ]
  }

  public static async setup() {
    return <LoadingList></LoadingList>
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Different styles of loading icons that can be used in iModel.js applications</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/component-gallery/loading-sample" />
          </div>
        </div>
      </>
    )
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        {this.getControlPane()}
        <ComponentContainer data={LoadingList.getLoadingData()}></ComponentContainer>
      </>
    );
  }

}
