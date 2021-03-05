/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { Checkbox, Icon, IconInput, Input, LabeledInput, LabeledSelect, LabeledTextarea, NumericInput, Radio, Select, Textarea } from "@bentley/ui-core";
import { SampleImageCheckBox } from "./SampleImageCheckBox";
import { ControlPane } from "common/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class InputsList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getInputsData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Basic Input", "Input with placeholder", <Input placeholder="Basic Input" />),
      createComponentExample("Disabled Input", "Input with disabled prop", <Input placeholder="Disabled Input" disabled />),

      createComponentExample("Check Box", "Basic Check Box", <Checkbox label="Basic Check Box" />),
      createComponentExample("Disabled Check Box", "Check Box with disabled prop", <Checkbox label="Disabled Check Box" disabled />),

      createComponentExample("Radio Button", "Basic Radio Button", <Radio label="Basic Radio Button" name="demo1" />),
      createComponentExample("Disabled Radio Button", "Radio Button with disabled prop", <Radio label="Disabled Radio Button" name="demo1" disabled />),

      createComponentExample("Basic Select", "Basic Select component", <Select options={["Option 1", "Option 2", "Option 3", "Option 4"]} />),
      createComponentExample("Disabled Select", "Select with disabled prop", <Select options={["Option 1", "Option 2", "Option 3", "Option 4"]} disabled />),
      createComponentExample("Placeholder Select", "Select with placeholder prop", <Select options={["Option 1", "Option 2", "Option 3", "Option 4"]} placeholder="Pick an option" />),

      createComponentExample("Basic Textarea", "Textarea with placeholder", <Textarea placeholder="Basic Textarea" />),
      createComponentExample("Disabled Textarea", "Textarea with disabled prop", <Textarea placeholder="Disabled Textarea" disabled />),

      createComponentExample("Numeric Input", "Numeric Input component", <NumericInput value={50} min={1} max={100} step={2.5} precision={1} className="uicore-full-width" />),
      createComponentExample("Icon Input", "Icon Input component", <IconInput placeholder="Icon Input" icon={<Icon iconSpec="icon-placeholder" />} containerClassName="uicore-full-width" />),
      createComponentExample("Labeled Input", "Labeled Input component", <LabeledInput label="Labeled Input" placeholder="Labeled Input" className="uicore-full-width" />),
      createComponentExample("Labeled Textarea", "Labeled Textarea component", <LabeledTextarea label="Labeled Textarea" placeholder="Labeled Textarea" className="uicore-full-width" />),
      createComponentExample("Labeled Select", "Labeled Select component", <LabeledSelect label="Labeled Select" options={["Option 1", "Option 2", "Option 3", "Option 4"]} />),
      createComponentExample("Image Checkbox", "ImageCheckbox with WebFonts", <SampleImageCheckBox imageOn="icon-more-circular" imageOff="icon-more-vertical-circular" />),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of inputs that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={InputsList.getInputsData()}></UIComponentContainer>
      </>
    );
  }

}
