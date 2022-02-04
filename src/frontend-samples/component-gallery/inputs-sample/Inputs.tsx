/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { IconButton, Input, LabeledInput, LabeledSelect, LabeledTextarea, Radio, Select, Textarea, ThemeProvider } from "@itwin/itwinui-react";
import { SvgCamera, SvgCloseSmall, SvgSmileyHappy, SvgSmileyNeutral, SvgSmileySad } from "@itwin/itwinui-icons-react";

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
      createComponentExample("Small Input", "Input with small size prop", <Input placeholder="Small Input" size={"small"} />),

      createComponentExample("Labeled Input", "Input with a Label", <LabeledInput displayStyle="default" label="This is a label" placeholder="Enter text here..." />),
      createComponentExample("Labeled Input with Message", "Input with a Label and a Message", <LabeledInput displayStyle="default" label="This is a label" message="This is a message" placeholder="Enter text here..." />),
      createComponentExample("Disabled Labeled Input", "Input with a Label with disabled prop", <LabeledInput displayStyle="default" label="This is a label" message="This is a message" placeholder="Enter text here..." disabled />),
      createComponentExample("Postive Labeled Input", "Input with a postive status", <LabeledInput displayStyle="default" label="This is a label" message="This is a message" placeholder="Enter text here..." status={"positive"} />),
      createComponentExample("Warning Labeled Input", "Input with a warning status", <LabeledInput displayStyle="default" label="This is a label" message="This is a message" placeholder="Enter text here..." status={"warning"} />),
      createComponentExample("Negative Labeled Input", "Input with a negative status", <LabeledInput displayStyle="default" label="This is a label" message="This is a message" placeholder="Enter text here..." status={"negative"} />),
      createComponentExample("Labeled Input with Custom Icon", "Input with an svgIcon prop", <LabeledInput displayStyle="default" label="This is a label" message="⬅ This is a custom icon" placeholder="Enter text here..." svgIcon={<SvgCamera />} />),
      createComponentExample("Inline Labeled Input", "Input with an inline displayStyle", <LabeledInput displayStyle="inline" label="This is a label" placeholder="Enter text here..." status="negative" />),
      createComponentExample("Hybrid Layout Labeled Input with Button", "Input with a Label and a Message", <LabeledInput displayStyle="default" iconDisplayStyle="inline" label="This is a label" message="Block layout with inline borderless button" placeholder="Enter text here..." svgIcon={<IconButton styleType="borderless"><SvgCloseSmall /></IconButton>} />),

      createComponentExample("Labeled Select", "Select Element with a Label", <LabeledSelect label={"This is a label"} placeholder={"Placeholder Text"} message={"This is a message"} options={[{ label: "Option 1", value: 1 }, { label: "Option 2", value: 2 }, { label: "Option 3", value: 3 }, { label: "Option 4", value: 4 }]} />),
      createComponentExample("Positive Labeled Select", "Select Element with a Label and positive status", <LabeledSelect status={"positive"} label={"This is a label"} placeholder={"Placeholder Text"} message={"This is a message"} options={[{ label: "Option 1", value: 1 }, { label: "Option 2", value: 2 }, { label: "Option 3", value: 3 }, { label: "Option 4", value: 4 }]} />),
      createComponentExample("Warning Labeled Select", "Select Element with a Label and warning status", <LabeledSelect status={"warning"} label={"This is a label"} placeholder={"Placeholder Text"} message={"This is a message"} options={[{ label: "Option 1", value: 1 }, { label: "Option 2", value: 2 }, { label: "Option 3", value: 3 }, { label: "Option 4", value: 4 }]} />),
      createComponentExample("Negative Labeled Select", "Select Element with a Label and negative status", <LabeledSelect status={"negative"} label={"This is a label"} placeholder={"Placeholder Text"} message={"This is a message"} options={[{ label: "Option 1", value: 1 }, { label: "Option 2", value: 2 }, { label: "Option 3", value: 3 }, { label: "Option 4", value: 4 }]} />),
      createComponentExample("Labeled Select with Custom Icon", "Select Element with a Label and custom icon", <LabeledSelect svgIcon={<SvgCamera></SvgCamera>} label={"This is a label"} placeholder={"Placeholder Text"} message={"This is a message"} options={[{ label: "Option 1", value: 1 }, { label: "Option 2", value: 2 }, { label: "Option 3", value: 3 }, { label: "Option 4", value: 4 }]} />),

      createComponentExample("Labeled Textarea", "Textarea with a label", <LabeledTextarea displayStyle="default" label="Textarea Label" message="Display Message" placeholder="This is a textarea" />),
      createComponentExample("Disabled Labeled Textarea", "Disabled textarea with a label", <LabeledTextarea disabled displayStyle="default" label="Textarea Label" message="Display Message" placeholder="This is a textarea" />),
      createComponentExample("Inline Labeled Textarea", "Textarea with a label and inline displayStyle", <LabeledTextarea displayStyle="inline" label="Textarea Label" message="Display Message" placeholder="This is a textarea" />),
      createComponentExample("Positive Labeled Textarea", "Textarea with a label and positive status", <LabeledTextarea status={"positive"} displayStyle="default" label="Textarea Label" message="Display Message" placeholder="This is a textarea" />),
      createComponentExample("Warning Labeled Textarea", "Textarea with a label and warning status", <LabeledTextarea status={"warning"} displayStyle="default" label="Textarea Label" message="Display Message" placeholder="This is a textarea" />),
      createComponentExample("Negative Labeled Textarea", "Textarea with a label and negative status", <LabeledTextarea status={"negative"} displayStyle="default" label="Textarea Label" message="Display Message" placeholder="This is a textarea" />),
      createComponentExample("Labeled Textarea with Custom Icon", "Textarea with a label and svgIcon prop", <LabeledTextarea svgIcon={<SvgCamera></SvgCamera>} displayStyle="default" label="Textarea Label" message="Display Message" placeholder="This is a textarea" />),

      createComponentExample("Radio", "Radio Input", <Radio label="Choose me!" />),
      createComponentExample("Disabled Radio", "Radio Input with disabled prop", <Radio disabled label="Choose me!" />),
      createComponentExample("Positive Radio", "Radio Input with positive status", <Radio status={"positive"} label="Choose me!" />),
      createComponentExample("Warning Radio", "Radio Input with warning status", <Radio status={"warning"} label="Choose me!" />),
      createComponentExample("Negative Radio", "Radio Input with negative status", <Radio status={"negative"} label="Choose me!" />),

      createComponentExample("Basic Select", "Basic Select component",
        <Select
          onChange={function noRefCheck() { }}
          options={[
            {
              label: "Item #1",
              value: 1,
            },
            {
              disabled: true,
              label: "Item #2",
              value: 2,
            },
            {
              label: "Item #3",
              value: 3,
            },
          ]}
          placeholder="Placeholder text"
        />,
      ),
      createComponentExample("Disabled Select", "Select with disabled prop",
        <Select
          disabled
          onChange={function noRefCheck() { }}
          options={[
            {
              label: "Item #1",
              value: 1,
            },
            {
              label: "Item #2",
              value: 2,
            },
            {
              label: "Item #3",
              value: 3,
            },
          ]}
          placeholder="Placeholder text"
        />,
      ),
      createComponentExample("Disabled Select with Selected Value", "Select with disabled prop and a selected value",
        <Select
          disabled
          onChange={function noRefCheck() { }}
          options={[
            {
              label: "Item #1",
              value: 1,
            },
            {
              label: "Item #2",
              value: 2,
            },
            {
              label: "Item #3",
              value: 3,
            },
          ]}
          placeholder="Placeholder text"
          popoverProps={{
            visible: true,
          }}
          value={2}
        />,
      ),
      createComponentExample("Many Items Select", "Select component containing many elements",
        <Select
          onChange={function noRefCheck() { }}
          options={[
            {
              label: "Item #0",
              value: 0,
            },
            {
              label: "Item #1",
              value: 1,
            },
            {
              label: "Item #2",
              value: 2,
            },
            {
              label: "Item #3",
              value: 3,
            },
            {
              label: "Item #4",
              value: 4,
            },
            {
              label: "Item #5",
              value: 5,
            },
            {
              label: "Item #6",
              value: 6,
            },
            {
              label: "Item #7",
              value: 7,
            },
            {
              label: "Item #8",
              value: 8,
            },
            {
              label: "Item #9",
              value: 9,
            },
            {
              label: "Item #10",
              value: 10,
            },
            {
              label: "Item #11",
              value: 11,
            },
            {
              label: "Item #12",
              value: 12,
            },
            {
              label: "Item #13",
              value: 13,
            },
            {
              label: "Item #14",
              value: 14,
            },
            {
              label: "Item #15",
              value: 15,
            },
            {
              label: "Item #16",
              value: 16,
            },
            {
              label: "Item #17",
              value: 17,
            },
            {
              label: "Item #18",
              value: 18,
            },
            {
              label: "Item #19",
              value: 19,
            },
          ]}
          placeholder="Placeholder text"
        />,
      ),
      createComponentExample("Select with Sublabels", "Select with elements that possess sublabels",
        <Select
          onChange={function noRefCheck() { }}
          options={[
            {
              label: "Item #1",
              sublabel: "Sublabel #1",
              value: 1,
            },
            {
              label: "Item #2",
              sublabel: "Sublabel #2",
              value: 2,
            },
            {
              label: "Item #3",
              sublabel: "Sublabel #3",
              value: 3,
            },
          ]}
          placeholder="Placeholder text"
          size="large"
        />,
      ),
      createComponentExample("Select with Truncated Middle Text", "Select long text that is truncated",
        <Select
          onChange={function noRefCheck() { }}
          options={[
            {
              label: "MyFileWithAReallyLongNameThatWillBeTruncatedBecauseItIsReallyThatLongSoHardToBelieve_FinalVersion_V2.html",
              value: "MyFileWithAReallyLongNameThatWillBeTruncatedBecauseItIsReallyThatLongSoHardToBelieve_FinalVersion_V2.html",
            },
            {
              label: "ShortNameFile.jpg",
              value: "ShortNameFile.jpg",
            },
            {
              label: "SomeOtherFile.dgn",
              value: "SomeOtherFile.dgn",
            },
          ]}
          placeholder="Placeholder text"
          value="MyFileWithAReallyLongNameThatWillBeTruncatedBecauseItIsReallyThatLongSoHardToBelieve_FinalVersion_V2.html"
        />,
      ),
      createComponentExample("Select with Icons", "Select with Icons included with option elements",
        <Select
          onChange={function noRefCheck() { }}
          options={[
            {
              icon: <SvgSmileyHappy />,
              label: "Happy",
              value: "happy",
            },
            {
              icon: <SvgSmileyNeutral />,
              label: "Neutral",
              value: "neutral",
            },
            {
              icon: <SvgSmileySad />,
              label: "Sad",
              value: "sad",
            },
          ]}
          placeholder="How are you today?"
        />,
      ),
      createComponentExample("Select with Selected Element", "Select with a selected value",
        <Select
          onChange={function noRefCheck() { }}
          options={[
            {
              label: "Item #1",
              value: 1,
            },
            {
              label: "Item #2",
              value: 2,
            },
            {
              label: "Item #3",
              value: 3,
            },
          ]}
          placeholder="Placeholder text"
          value={2}
        />,
      ),

      createComponentExample("Basic Textarea", "Textarea with placeholder", <Textarea placeholder="Basic Textarea" />),
      createComponentExample("Disabled Textarea", "Textarea with disabled prop", <Textarea placeholder="Disabled Textarea" disabled />),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ThemeProvider theme={"dark"} />
        <ControlPane instructions="Different styles of inputs that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={InputsList.getInputsData()}></UIComponentContainer>
      </>
    );
  }

}
