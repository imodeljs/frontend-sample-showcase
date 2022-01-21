/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { ProgressLinear, ProgressRadial } from "@itwin/itwinui-react";
import { SvgStatusErrorHollow, SvgStatusSuccessHollow } from "@itwin/itwinui-icons-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class LoadingList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getLoadingData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Animated Determinate ProgressLinear", undefined, <ProgressLinear style={{ width: "100%" }} isAnimated value={50} />),
      createComponentExample("Indeterminate ProgressLinear", undefined, <ProgressLinear style={{ width: "100%" }} isAnimated indeterminate />),
      createComponentExample("Labeled Center ProgressLinear", undefined, <ProgressLinear
        style={{ width: "100%" }}
        labels={[
          "Centered Label",
        ]}
        value={50}
      />),
      createComponentExample("Labeled Left/Right ProgressLinear", undefined, <ProgressLinear
        style={{ width: "100%" }}
        labels={[
          "Loading...",
          "50%",
        ]}
        value={50}
      />),
      createComponentExample("Negative ProgressLinear", undefined, <ProgressLinear
        style={{ width: "100%" }}
        labels={[
          "Upload failed",
          <SvgStatusErrorHollow key={""} />,
        ]}
        status="negative"
        value={45}
      />),
      createComponentExample("Positive ProgressLinear", undefined, <ProgressLinear
        style={{ width: "100%" }}
        labels={[
          "Upload done!",
          <SvgStatusSuccessHollow key={""} />,
        ]}
        status="positive"
        value={100}
      />),
      createComponentExample("Determinate ProgressRadial", undefined, <ProgressRadial value={50} />),
      createComponentExample("Indeterminate ProgressRadial", undefined, <ProgressRadial indeterminate value={50} />),
      createComponentExample("Positive ProgressRadial", undefined, <ProgressRadial status={"positive"} value={100} />),
      createComponentExample("Negative ProgressRadial", undefined, <ProgressRadial status={"negative"} value={50} />),
      createComponentExample("Content ProgressRadial", undefined, <ProgressRadial value={50}>50</ProgressRadial>),

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
