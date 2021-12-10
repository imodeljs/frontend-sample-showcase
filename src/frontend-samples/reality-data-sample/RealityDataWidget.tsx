/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import React, { useEffect } from "react";
import { Toggle } from "@itwin/core-react";
import { IModelApp, ScreenViewport } from "@itwin/core-frontend";
import RealityDataApi from "./RealityDataApi";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import "./RealityData.scss";
import { ContextRealityModelProps } from "@itwin/core-common";

const RealityDataWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  // START STATE
  const showRealityDataState = React.useRef<Map<string, boolean>>(new Map());
  const transparencyRealityDataState = React.useRef<Map<string, number>>(new Map());
  const [availableRealityModels, setAvailableRealityModels] = React.useState<ContextRealityModelProps[]>();
  const [updateAttachedState, setUpdateAttachedState] = React.useState<string>("");
  const [updateTransparencyState, setUpdateTransparencyState] = React.useState<string>("");
  // END STATE

  // START INITIAL_STATE
  // Initialize the widget
  useEffect(() => {
    IModelApp.viewManager.onViewOpen.addOnce(async (_vp: ScreenViewport) => {
      const availRealityModels = await RealityDataApi.getRealityModels(_vp.iModel);
      setAvailableRealityModels(availRealityModels);
      for (const model of availRealityModels) {
        showRealityDataState.current.set(model.tilesetUrl, true);
        RealityDataApi.toggleRealityModel(model, _vp, true);
        RealityDataApi.setRealityDataTransparency(model, _vp, 0);
      }
    });
  }, []);
  // END INITIAL_STATE

  // START REALITY_HOOK
  // When the button is toggled, display the realityModel and set its transparency to where the slider is currently set.
  useEffect(() => {
    if (iModelConnection && updateAttachedState) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp && availableRealityModels && showRealityDataState) {
        const model = availableRealityModels.find((x) => x.tilesetUrl === updateAttachedState);
        if (model) {
          RealityDataApi.toggleRealityModel(model, vp, showRealityDataState.current.get(model.tilesetUrl));
          RealityDataApi.setRealityDataTransparency(model, vp, transparencyRealityDataState.current.get(model.tilesetUrl));
        }
      }
    }
    setUpdateAttachedState("");
  }, [availableRealityModels, iModelConnection, showRealityDataState, updateAttachedState]);
  // END REALITY_HOOK

  // START TRANSPARENCY_HOOK
  useEffect(() => {
    if (iModelConnection && updateTransparencyState) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp && availableRealityModels && showRealityDataState) {
        const model = availableRealityModels.find((x) => x.tilesetUrl === updateTransparencyState);
        if (model)
          RealityDataApi.setRealityDataTransparency(model, vp, transparencyRealityDataState.current.get(model.tilesetUrl));
      }
    }
    setUpdateTransparencyState("");
  }, [availableRealityModels, iModelConnection, transparencyRealityDataState, updateTransparencyState]);
  // END TRANSPARENCY_HOOK

  const updateShowRealityDataState = (url: string, checked: boolean) => {
    showRealityDataState.current.set(url, checked);
    setUpdateAttachedState(url);
  };

  const updateRealityDataTransparencyState = (url: string, val: number) => {
    transparencyRealityDataState.current.set(url, val);
    setUpdateTransparencyState(url);
  };

  // START WIDGET_UI
  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col">
          {availableRealityModels && availableRealityModels.map((element, index) => {
            return (
              <>
                <span>{element.name}</span>
                <Toggle key={element.tilesetUrl} isOn={true} onChange={async (checked: boolean) => updateShowRealityDataState(element.tilesetUrl, checked)} />
                {element.orbitGtBlob === undefined && /** Point Clouds do not have transparency override support in v2.x. This will be available in v3.x. */
                  <><span><span style={{ marginRight: "1em" }} className="icon icon-help" title={"Adjusting this slider changes the transparency of the reality data."}></span>{"Transparency"}</span>
                    <input type={"range"} min={0} max={99} defaultValue={0} onChange={(event: React.ChangeEvent<HTMLInputElement>) => updateRealityDataTransparencyState(element.tilesetUrl, Math.abs(Number(event.target.value) / 100))} />
                  </>}
                {index + 1 < availableRealityModels.length && <div className="row-break"></div>}
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
          label: "Reality Data Controls",
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
