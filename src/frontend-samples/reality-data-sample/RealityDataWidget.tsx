/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Toggle } from "@bentley/ui-core";
import { IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";
import { RealityDataApi } from "./RealityDataApi";
import { StagePanelLocation, StagePanelSection, useActiveIModelConnection, WidgetState } from "@bentley/ui-framework";
import { AbstractWidgetProps, UiItemsProvider } from "@bentley/ui-abstract";
import "./RealityData.scss";

const RealityDataWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [showRealityDataState, setShowRealityDataState] = React.useState<boolean>(true);
  const [realityDataTransparencyState, setRealityDataTransparencyState] = React.useState<number>(0);

  // Initalize the widget
  useEffect(() => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      await RealityDataApi.toggleRealityModel(showRealityDataState, _vp, _vp.iModel);
      await RealityDataApi.setRealityDataTransparency(_vp, realityDataTransparencyState);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // When just the transparency bar is changed, only call update transparency
  useEffect(() => {
    const vp = IModelApp.viewManager.selectedView;
    if (vp) {
      RealityDataApi.setRealityDataTransparency(vp, realityDataTransparencyState);
    }
  }, [realityDataTransparencyState]);

  // When the button is toggled, display the realityModel and set its transparency to where the slider is currently at.
  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        RealityDataApi.toggleRealityModel(showRealityDataState, vp, iModelConnection).then(() => {
          RealityDataApi.setRealityDataTransparency(vp, realityDataTransparencyState);
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRealityDataState]);

  // Create the react components for the toggle
  const createToggle = (label: string, info: string) => {
    const element = <Toggle isOn={showRealityDataState} onChange={async (checked: boolean) => setShowRealityDataState(checked)} />;
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  };

  // Create the react component for the transparency slider
  const createTransparencySlider = (label: string, info: string) => {
    const element = <input type={"range"} min={0} max={99} defaultValue={0} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRealityDataTransparencyState(Math.abs(Number(event.target.value) / 100))} />;
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {createToggle("Reality Data", "Toggle showing the reality data in the model.")}
          {createTransparencySlider("Reality Data Transparency", "Adjusting this slider changes the transparency of the reality data. Does not apply if reality data is not currently being displayed.")}
        </div>
      </div>
    </>
  );
};

export class RealityDataWidgetProvider implements UiItemsProvider {
  public readonly id: string = "RealityDataWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "RealityDataWidget",
          label: "Reality Data Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <RealityDataWidget />,
        }
      );
    }
    return widgets;
  }
}
