/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Toggle } from "@bentley/ui-core";

export interface RealityDataWidgetProps {
  showRealityData: boolean;
  realityDataTransparency: number;
  onToggleRealityData: (showRealityData: boolean, realityDataTransparency: number) => void;
  onChangeRealityDataTransparency: (realityDataTransparency: number) => void;
}

export const RealityDataWidget: React.FunctionComponent<RealityDataWidgetProps> = ({ showRealityData, realityDataTransparency, onToggleRealityData, onChangeRealityDataTransparency }) => {
  const [showRealityDataState, setShowRealityDataState] = React.useState<boolean>(showRealityData);
  const [realityDataTransparencyState, setRealityDataTransparencyState] = React.useState<number>(realityDataTransparency);

  // When just the transparency bar is changed, only call update transparency
  useEffect(() => {
    onChangeRealityDataTransparency(realityDataTransparencyState);
  }, [onChangeRealityDataTransparency, realityDataTransparencyState]);

  // When the button is toggled, display the realityModel and set its transparency to where the slider is currently at.
  useEffect(() => {
    onToggleRealityData(showRealityDataState, realityDataTransparencyState);
  }, [onToggleRealityData, realityDataTransparencyState, showRealityDataState]);

  // Create the react components for the toggle
  const createToggle = (label: string, info: string) => {
    const element = <Toggle isOn={showRealityDataState} onChange={async (checked: boolean) => _onChangeToggle(checked)} />;
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  };

  // Create the react component for the transparency slider
  const createTransparencySlider = (label: string, info: string) => {
    const element = <input type={"range"} min={0} max={99} defaultValue={99} onChange={_onChangeSlider} />;
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  };

  // Handle changes to the toggle.
  const _onChangeToggle = async (checked: boolean) => {
    setShowRealityDataState(checked);
  };

  const _onChangeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRealityDataTransparencyState(Math.abs((Number(event.target.value) / 100) - 1));
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {createToggle("Reality Data", "Toggle showing the reality data in the model.")}
        {createTransparencySlider("Reality Data Transparency", "Adjusting this slider changes the transparency of the reality data. Does not apply if reality data is not currently being displayed.")}
      </div>
    </>
  );
};
