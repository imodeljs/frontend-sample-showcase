/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Toggle } from "@bentley/ui-core";
import { IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";
import RealityDataApi from "./RealityDataApi";
import { StagePanelLocation, StagePanelSection, useActiveIModelConnection, WidgetState } from "@bentley/ui-framework";
import { AbstractWidgetProps, UiItemsProvider } from "@bentley/ui-abstract";
import "./RealityData.scss";
import { ContextRealityModelProps } from "@bentley/imodeljs-common";

const RealityDataWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  // START STATE
  const showRealityDataState = React.useRef<Map<string, boolean>>(new Map());
  const transparencyRealityDataState = React.useRef<Map<string, number>>(new Map());
  // const [realityDataTransparencyState, setRealityDataTransparencyState] = React.useState<Map<string, number>>();
  const [availableRealityModels, setAvailableRealityModels] = React.useState<ContextRealityModelProps[]>();
  const [updateState, setUpdateState] = React.useState<string>("");

  // END STATE

  // START INITIAL_STATE
  // Initialize the widget
  useEffect(() => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      const initialStateTransparency = new Map();
      const availRealityModels = await RealityDataApi.getRealityModels(_vp.iModel);
      setAvailableRealityModels(availRealityModels);
      for (const model of availRealityModels) {
        showRealityDataState.current.set(model.tilesetUrl, true);
        initialStateTransparency.set(model.tilesetUrl, 50);
        RealityDataApi.toggleRealityModel(model, _vp, true);
        RealityDataApi.setRealityDataTransparency(model, _vp, 0);
      }
      // setRealityDataTransparencyState(initialStateTransparency);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // END INITIAL_STATE

  // START TRANSPARENCY_HOOK
  // When just the transparency bar is changed, only call update transparency
  // useEffect(() => {
  //  const vp = IModelApp.viewManager.selectedView;
  //  if (vp) {
  //    RealityDataApi.setRealityDataTransparency(vp, realityDataTransparencyState)
  //      .catch((error) => {
  //        // eslint-disable-next-line no-console
  //        console.error(error);
  //      });
  //  }
  // }, [realityDataTransparencyState]);
  // END TRANSPARENCY_HOOK

  // START REALITY_TOGGLE
  // Create the react components for the toggle
  // const createToggle = (label: string, info: string) => {
  //   const element = <Toggle isOn={showRealityDataState?.get("")} onChange={async (checked: boolean) => setShowRealityDataState(checked)} />;
  //   return (
  //     <>
  //       <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
  //       {element}
  //     </>
  //   );
  // };
  // const createRealityModelItem = (realityDataContext: ContextRealityModelProps) => {
  //   const elem = <Toggle isOn={true} onChange={async (checked: boolean) => setShowRealityDataState(checked)} />;
  //   return (
  //     <>
  //       <span>{realityDataContext.name}</span>
  //       {elem}
  //     </>
  //   );
  // };
  // END REALITY_TOGGLE

  // START TRANSPARENCY_SLIDER
  // Create the react component for the transparency slider
  // const createTransparencySlider = (label: string, info: string) => {
  //   const element = <input type={"range"} min={0} max={99} defaultValue={0} onChange={(event: React.ChangeEvent<HTMLInputElement>) => setRealityDataTransparencyState(Math.abs(Number(event.target.value) / 100))} />;
  //   return (
  //     <>
  //       <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
  //       {element}
  //     </>
  //   );
  // };
  // END TRANSPARENCY_SLIDER

  // START REALITY_HOOK
  // When the button is toggled, display the realityModel and set its transparency to where the slider is currently at.
  useEffect(() => {
    if (iModelConnection && updateState) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp && availableRealityModels && showRealityDataState) {
        const model = availableRealityModels.find((x) => x.tilesetUrl === updateState);
        if (model)
          RealityDataApi.toggleRealityModel(model, vp, showRealityDataState.current.get(model.tilesetUrl));
      }
    }
    setUpdateState("");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showRealityDataState, updateState]);
  // END REALITY_HOOK

  const updateShowRealityDataState = (url: string, checked: boolean) => {
    showRealityDataState.current.set(url, checked);
    setUpdateState(url);
  };

  // const updateRealityDataTransparencyState = (url: string, val: number) => {
    // transparencyRealityDataState.current.set(url, val);
  // };

  // START WIDGET_UI
  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {availableRealityModels && availableRealityModels.map((element) => {
            return (
              <>
                <span>{element.name}</span>
                <Toggle key={element.tilesetUrl} isOn={true} onChange={async (checked: boolean) => updateShowRealityDataState(element.tilesetUrl, checked)} />
                <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={"Transparency"}></span>{"Adjusting this slider."}</span>
                {/* <input type={"range"} min={0} max={99} defaultValue={0} onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateRealityDataTransparencyState(element.tilesetUrl, Math.abs(Number(event.target.value) / 100))} /> */}
              </>);
          })
          }
        </div>
      </div>
    </>
  );
  // END WIDGET_UI
};

// START UI_ITEMS_PROVIDER
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
// END UI_ITEMS_PROVIDER
