/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { Input, Select, Toggle } from "@bentley/ui-core";
import React, { useEffect } from "react";
import { ElemProperty, ShowcaseToolAdmin, TooltipCustomizeSettings } from "./TooltipCustomizeApi";

export const TooltipCustomizeWidget: React.FunctionComponent = () => {
  const [settingsState, setSettingsState] = React.useState<TooltipCustomizeSettings>(ShowcaseToolAdmin.get().settings);

  useEffect(() => {
    const toolAdmin = ShowcaseToolAdmin.get();
    toolAdmin.settings = settingsState;
  }, [settingsState]);

  const options = {
    [ElemProperty.Origin]: "Origin",
    [ElemProperty.LastModified]: "Last Modified",
    [ElemProperty.CodeValue]: "Code value",
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-3col">
          <Toggle isOn={settingsState.showImage} onChange={(checked) => setSettingsState({ ...settingsState, showImage: checked })} />
          <span>Show Image</span>
          <span></span>
          <Toggle isOn={settingsState.showCustomText} onChange={(checked) => setSettingsState({ ...settingsState, showCustomText: checked })} />
          <span>Show Custom Text</span>
          <Input type="text" value={settingsState.customText} onChange={(event) => setSettingsState({ ...settingsState, customText: event.target.value })} disabled={!settingsState.showCustomText} />
          <Toggle isOn={settingsState.showElementProperty} onChange={(checked) => setSettingsState({ ...settingsState, showElementProperty: checked })} />
          <span>Show Element Property</span>
          <Select onChange={(event) => setSettingsState({ ...settingsState, elemProperty: event.target.value as ElemProperty })} value={settingsState.elemProperty} disabled={!settingsState.showElementProperty} options={options} />
          <Toggle isOn={settingsState.showDefaultToolTip} onChange={(checked) => setSettingsState({ ...settingsState, showDefaultToolTip: checked })} />
          <span>Show Default ToolTip</span>
          <span></span>
        </div>
      </div>
    </>
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
        }
      );
    }
    return widgets;
  }
}
