/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import RealityDataApp from "./RealityDataApp";
import { useActiveIModelConnection } from "@bentley/ui-framework";

export const RealityDataWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [showRealityDataState, setShowRealityDataState] = React.useState<boolean>(true);
  const [realityDataTransparencyState, setRealityDataTransparencyState] = React.useState<number>(0);

  // Only runs once because of the empty array passed as dependency [], similar to componentDidMount
  useEffect(() => {
    if (iModelConnection) {
      IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
        await RealityDataApp.toggleRealityModel(true, _vp, _vp.iModel);
        await RealityDataApp.setRealityDataTransparency(_vp, realityDataTransparencyState);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When just the transparency bar is changed, only call update transparency
  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        RealityDataApp.setRealityDataTransparency(vp, realityDataTransparencyState);
      }
    }
  }, [iModelConnection, realityDataTransparencyState])

  // When the button is toggled, display the realityModel and set its transparency to where the slider is currently at.
  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        RealityDataApp.toggleRealityModel(showRealityDataState, vp, iModelConnection).then(() => {
          RealityDataApp.setRealityDataTransparency(vp, realityDataTransparencyState);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iModelConnection, showRealityDataState])

  // Create the react components for the toggle
  const createToggle = (label: string, info: string) => {
    const element = <Toggle isOn={showRealityDataState} onChange={async (checked: boolean) => _onChangeToggle(checked)} />;
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  }

  // Create the react component for the transparency slider
  const createTransparencySlider = (label: string, info: string) => {
    const element = <input type={"range"} min={0} max={99} defaultValue={99} onChange={_onChangeSlider} />;
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  }

  // Handle changes to the toggle.
  const _onChangeToggle = async (checked: boolean) => {
    setShowRealityDataState(checked);
  }

  const _onChangeSlider = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRealityDataTransparencyState(Math.abs((Number(event.target.value) / 100) - 1));
  }

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {createToggle("Reality Data", "Toggle showing the reality data in the model.")}
        {createTransparencySlider("Reality Data Transparency", "Adjusting this slider changes the transparency of the reality data. Does not apply if reality data is not currently being displayed.")}
      </div>
    </>
  );
}
