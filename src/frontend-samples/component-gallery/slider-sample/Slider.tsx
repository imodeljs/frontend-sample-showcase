/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import "common/CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "common/CommonComponentTools/ComponentContainer";
import { Icon, Slider } from "@bentley/ui-core";
import SampleApp from "common/SampleApp";
import { ControlPane } from "Components/ControlPane/ControlPane";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export default class SliderList extends React.Component<{}> implements SampleApp {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getSliderData(): ComponentExampleProps[] {
    return [
      createComponentExample("Slider", "Basic Slider",
        <Slider min={0} max={100} values={[50]} step={1} showTooltip />),
      createComponentExample("Slider w/ tooltipBelow", "Slider with Tooltip Below",
        <Slider min={0} max={100} values={[50]} step={1} showTooltip tooltipBelow />),
      createComponentExample("Slider w/ min/max", "Slider with showMinMax prop",
        <Slider min={0} max={100} values={[50]} step={1} showTooltip showMinMax />),
      createComponentExample("Slider w/ min/max images", "Slider with minImage and maxImage props",
        <Slider min={0} max={100} values={[50]} step={1} showTooltip showMinMax
          minImage={<Icon iconSpec="icon-placeholder" />} maxImage={<Icon iconSpec="icon-placeholder" />} />),
      createComponentExample("Slider w/ tick marks", "Slider with showTicks and getTickCount props",
        <Slider min={0} max={100} values={[50]} step={1} showTooltip showMinMax
          showTicks getTickCount={() => 10} />),
      createComponentExample("Slider w/ multiple values", "Slider with array of values",
        <Slider min={0} max={100} values={[30, 70]} step={5} mode={2} showTooltip showMinMax
          showTicks getTickCount={() => 10} />),
      createComponentExample("Slider multiple values tooltipBelow", "Slider with multiple values & tooltip below",
        <Slider min={0} max={100} values={[20, 80]} step={5} mode={2} showTooltip tooltipBelow showMinMax
          showTicks getTickCount={() => 10} />),
      createComponentExample("Slider w/ tick labels", "Slider with showTickLabels prop",
        <Slider min={0} max={100} values={[50]} step={1} showTooltip showMinMax showTickLabels
          showTicks getTickCount={() => 10} />),
    ];
  }

  public static async setup(_iModelName: string) {
    return <SliderList></SliderList>;
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of sliders that can be used in iModel.js applications."></ControlPane>
        <ComponentContainer data={SliderList.getSliderData()}></ComponentContainer>
      </>
    );
  }
}
