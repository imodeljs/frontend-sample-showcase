/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Input, Select, ToggleSwitch } from "@itwin/itwinui-react";
import { ElemProperty, toolAdmin, TooltipCustomizeSettings } from "./TooltipCustomizeApi";
import "./TooltipCustomize.scss";

export const TooltipCustomizeWidget: React.FunctionComponent = () => {
  const [settingsState, setSettingsState] = React.useState<TooltipCustomizeSettings>(() => toolAdmin.settings);

  useEffect(() => {
    toolAdmin.settings = settingsState;
  }, [settingsState]);

  const options = [
    { value: ElemProperty.Origin, label: "Origin" },
    { value: ElemProperty.LastModified, label: "Last Modified" },
    { value: ElemProperty.CodeValue, label: "Code value" },
  ];

  return (
    <div className="sample-options">
      <div className="tooltip-selection">
        <ToggleSwitch
          label="Show Image"
          checked={settingsState.showImage}
          onChange={() => setSettingsState((state) => ({ ...state, showImage: !state.showImage }))} />
        <div className="control">
          <ToggleSwitch
            label="Show Element Property"
            checked={settingsState.showElementProperty}
            onChange={() => setSettingsState((state) => ({ ...state, showElementProperty: !state.showElementProperty }))} />
          <Select
            className="sample-grid-control"
            onChange={(value) => setSettingsState({ ...settingsState, elemProperty: value })}
            value={settingsState.elemProperty}
            disabled={!settingsState.showElementProperty}
            options={options} />
        </div>
        <div className="control">
          <ToggleSwitch
            label="Show Custom Text"
            checked={settingsState.showCustomText}
            onChange={() => setSettingsState((state) => ({ ...state, showCustomText: !state.showCustomText }))} />
          <Input
            className="sample-grid-control"
            type="text"
            value={settingsState.customText}
            onChange={(event) => setSettingsState({ ...settingsState, customText: event.target.value })}
            disabled={!settingsState.showCustomText} />
        </div>
        <ToggleSwitch
          label="Show Default ToolTip"
          checked={settingsState.showDefaultToolTip}
          onChange={() => setSettingsState((state) => ({ ...state, showDefaultToolTip: !state.showDefaultToolTip }))} />
      </div>
    </div>
  );
};

export class TooltipCustomizeWidgetProvider implements UiItemsProvider {
  public readonly id: string = "TooltipCustomizeWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "TooltipCustomizeWidget",
          label: "Tooltip Customize Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <TooltipCustomizeWidget />,
        },
      );
    }
    return widgets;
  }
}
