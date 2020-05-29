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
import {ComponentContainer, ComponentExampleProps} from "../CommonComponentTools/ComponentContainer";

import { Icon, Slider } from "@bentley/ui-core";

export function getSliderSpec(): SampleSpec {
  return ({
    name: "slider-sample",
    label: "Slider",
    image: "viewport-only-thumbnail.png",
    setup: SliderList.setup ,
  });
}

export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export class SliderList extends React.Component<{}> {

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

  public static async setup() {
    return <SliderList></SliderList>;
  }

  public render() {
    return (
      <>
      <div className="sample-ui">
        <div>
          <span>Different Styles of Buttons</span>
          <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
          <ComponentContainer data = {SliderList.getSliderData()} />
        </div>
      </div>
      </>
    );
  }

}
