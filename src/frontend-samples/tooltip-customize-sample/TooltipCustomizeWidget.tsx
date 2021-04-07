import { Input, Select, Toggle } from "@bentley/ui-core";
import React, { useEffect } from "react";
import { ElemProperty, TooltipCustomizeSettings } from "./TooltipCustomizeUI";

export interface TooltipCustomizeWidgetProps {
  settings: TooltipCustomizeSettings;
  setSettings: (settings: TooltipCustomizeSettings) => void;
}

export const TooltipCustomizeWidget: React.FunctionComponent<TooltipCustomizeWidgetProps> = ({ settings, setSettings }) => {
  const [settingsState, setSettingsState] = React.useState<TooltipCustomizeSettings>(settings);

  useEffect(() => {
    setSettings(settingsState);
  }, [setSettings, settingsState]);

  const options = {
    [ElemProperty.Origin]: "Origin",
    [ElemProperty.LastModified]: "Last Modified",
    [ElemProperty.CodeValue]: "Code value",
  };

  return (
    <>
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
    </>
  );
};
