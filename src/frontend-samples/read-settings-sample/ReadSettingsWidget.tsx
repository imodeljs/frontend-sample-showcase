import React, { ChangeEvent, useEffect, useState } from "react";
import { Button, DisabledText, Select, SmallText, Spinner, SpinnerSize, Textarea } from "@bentley/ui-core";
import { SettingsResult, SettingsStatus } from "@bentley/product-settings-client";
import { settingsKeys } from "./ReadSettingsUI";

export interface ReadSettingsWidgetProps {
  settingsKey?: string;
  settingsResult?: SettingsResult;
  saveSettings: (settingsValue: string) => Promise<void>;
  onSettingsChange: (setting: string) => void;
}

const parseSettingsValue = (name: string, value: string) => {
  let _value;
  switch (name) {
    case "Json_Data":
      _value = JSON.stringify(value || "", null, "   ");
      break;
    default:
      _value = value || "";
  }
  return _value;
};

export const ReadSettingsWidget: React.FunctionComponent<ReadSettingsWidgetProps> = ({ settingsKey, settingsResult, onSettingsChange, saveSettings }) => {
  const [settingValue, setSettingValue] = useState<string>("");
  const [saveInProgress, setSaveInProgress] = useState<boolean>(false);

  useEffect(() => {
    if (settingsKey && settingsResult && settingsResult.status === SettingsStatus.Success) {
      setSettingValue(parseSettingsValue(settingsKey, settingsResult.setting));
    }
  }, [settingsResult, settingsKey]);

  // Handler to read external settings when name in dropdown changes
  const _handleSettingsChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const settingKeyValue = event.target.value;
    onSettingsChange(settingKeyValue);
  };

  // Handler to get settings value into state, when you modify textarea element in the dialog
  const _handleSettingsValueChange = (event: any) => {
    const value = event.target.value;
    setSettingValue(value);
  };

  // The showcase does not have permission to write data, it is expected to fail with 403 Forbidden.
  const _saveSettings = async () => {
    setSaveInProgress(true);
    await saveSettings(settingValue);
    setSaveInProgress(false);
  };

  // Helper method to show status get/write operations with external setting in the dialog
  const showStatus = () => {
    if (!settingsResult || settingsResult.status === SettingsStatus.Success) {
      return (<div></div>);
    }

    return (
      <div style={{ lineBreak: "anywhere", overflowWrap: "break-word", maxWidth: "30vw" }}>
        <SmallText style={{ color: "var(--foreground-alert)" }}>
          {`${settingsResult.status} ${settingsResult.errorMessage}`}
        </SmallText>
      </div>
    );
  };

  // Display drawing and sheet options in separate sections.
  return !settingsResult && !settingsKey ? (<div style={{ width: "395px" }}><Spinner size={SpinnerSize.Small} /> loading...</div>) : (
    <>
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Settings Name:</span>
        <Select value={settingsKey} onChange={_handleSettingsChange} style={{ width: "fit-content" }} options={settingsKeys} />
      </div>
      <Textarea rows={10} key="test" className="uicore-full-width" value={settingValue} onChange={_handleSettingsValueChange} />
      {showStatus()}
      <div style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {saveInProgress ?
          (<div ><Spinner size={SpinnerSize.Small} /> Saving...</div>) :
          <Button onClick={_saveSettings} disabled={!settingsKey}>Save settings</Button>
        }
      </div>
      <DisabledText>Note: save does not work in this read-only environment.</DisabledText><br />
      <DisabledText>Forbidden error is expected.</DisabledText>
    </>
  );
};

