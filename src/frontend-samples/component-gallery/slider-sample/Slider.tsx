/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { Slider } from "@itwin/itwinui-react";
import { SvgSmileyHappy, SvgSmileySad } from "@itwin/itwinui-icons-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class SliderList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getSliderData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Slider", "Basic Slider",
        <Slider
          style={{ width: "100%" }}
          thumbMode="inhibit-crossing"
          trackDisplayMode="auto"
          values={[
            50,
          ]}
        />),
      createComponentExample("Range Slider", "Slider with supporting range selection",
        <Slider
          style={{ width: "100%" }}
          max={100}
          min={0}
          thumbMode="inhibit-crossing"
          trackDisplayMode="auto"
          values={[
            20,
            80,
          ]}
        />),
      createComponentExample("Multi-Thumb Slider", "Multi-Thumb Slider that allows Crossing",
        <Slider
          style={{ width: "100%" }}
          thumbMode="allow-crossing"
          trackDisplayMode="even-segments"
          values={[
            20,
            40,
            60,
            80,
          ]}
        />),
      createComponentExample("Slider w/ min/max images", "Slider with minLabel and maxLabel props",
        <Slider
          style={{ width: "100%" }}
          maxLabel={<SvgSmileySad />}
          minLabel={<SvgSmileyHappy />}
          railContainerProps={{
            style: {
              margin: "0 8px",
            },
          }}
          thumbMode="inhibit-crossing"
          trackDisplayMode="auto"
          values={[
            50,
          ]}
        />),
      createComponentExample("Disabled Slider", "Slider with disabled prop",
        <Slider
          style={{ width: "100%" }}
          disabled
          max={60}
          min={0}
          thumbMode="inhibit-crossing"
          trackDisplayMode="auto"
          values={[
            30,
          ]}
        />),
      createComponentExample("Custom Tooltip Slider", "Slider with a customized ToolTip",
        < Slider
          style={{ width: "100%" }}
          max={60}
          min={0}
          thumbMode="inhibit-crossing"
          tickLabels={
            [
              "0",
              "20",
              "40",
              "60",
            ]}
          trackDisplayMode="auto"
          tooltipProps={function noRefCheck(_index: number, value: number) { return { content: `$${value}.00` }; }}
          values={
            [
              20,
            ]}
        />),
      createComponentExample("Decimal Increment Slider", "Slider with Decimal Increment",
        <Slider
          style={{ width: "100%" }}
          max={50}
          min={0}
          step={2.5}
          thumbMode="inhibit-crossing"
          trackDisplayMode="auto"
          values={[
            25,
          ]}
        />),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of sliders that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={SliderList.getSliderData()}></UIComponentContainer>
      </>
    );
  }
}
