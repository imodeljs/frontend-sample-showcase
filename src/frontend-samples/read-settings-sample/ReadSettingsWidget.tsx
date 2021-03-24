import React, { ChangeEvent, useEffect, useState } from "react";
import { useActiveIModelConnection } from "@bentley/ui-framework";
import ReadSettingsApp from "./ReadSettingsApp";
import { Button, DisabledText, Select, SmallText, Spinner, SpinnerSize, Textarea } from "@bentley/ui-core";
import { SettingsResult, SettingsStatus } from "@bentley/product-settings-client";

const settingsKeys = ["Json_Data", "Arbitrary_Text", "CSV_Data"];

export const ReadSettingsWidget: React.FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();
  const [saveInProgress, setSaveInProgress] = useState<Boolean>(false);
  const [settingsInitialized, setSettingsInitialized] = useState<Boolean>(false);
  const [settingKey, setSettingKey] = useState<string>(settingsKeys[0]);
  const [settingValue, setSettingValue] = useState<string>();
  const [settingResult, setSettingResult] = useState<SettingsResult>();

  useEffect(() => {
    if (iModelConnection) {
      ReadSettingsApp.readSettings(iModelConnection.iModelId!, iModelConnection.contextId!, settingsKeys[0]).then((response) => {
        setSettingResult(response);
        setSettingValue(parseSettingsValue(settingsKeys[0], response.setting));
        setSettingsInitialized(true);
      });
    }
  }, [iModelConnection]);

  const parseSettingsValue = (name: string, value: string) => {
    let _value;
    switch (name) {
      case settingsKeys[0]:
        _value = JSON.stringify(value || "", null, "   ");
        break;
      default:
        _value = value || "";
    }
    return _value;
  };

  // Handler to read external settings when name in dropdown changes
  const _handleSettingsChange = (event: ChangeEvent<HTMLSelectElement>) => {
    if (iModelConnection) {
      const settingKeyValue = event.target.value;
      setSettingKey(settingKeyValue);
      ReadSettingsApp.readSettings(iModelConnection.iModelId!, iModelConnection.contextId!, settingKeyValue).then((response) => {
        setSettingResult(response);
        setSettingValue(parseSettingsValue(settingKeyValue, response.setting));
      });
    }
  };

  // Handler to get settings value into state, when you modify textarea element in the dialog
  const _handleSettingsValueChange = (event: any) => {
    const value = event.target.value;
    setSettingValue(value);
  };

  // The showcase does not have permission to write data, it is expected to fail with 403 Forbidden.
  const _saveSettings = () => {
    if (iModelConnection) {
      setSaveInProgress(true);
      ReadSettingsApp.saveSettings(iModelConnection.iModelId!, iModelConnection.contextId!, settingKey, settingValue!).then((response) => {
        setSettingResult(response);
        setSaveInProgress(false);
      });
    }
  };

  // Helper method to show status get/write operations with external setting in the dialog
  const showStatus = () => {
    if (!settingResult || settingResult.status === SettingsStatus.Success) {
      return (<div></div>);
    }

    return (
      <div style={{ lineBreak: "anywhere", overflowWrap: "break-word", maxWidth: "30vw" }}>
        <SmallText style={{ color: "var(--foreground-alert)" }}>
          {`${settingResult.status} ${settingResult.errorMessage}`}
        </SmallText>
      </div>
    );
  };

  // Display drawing and sheet options in separate sections.
  return !settingsInitialized ? (<div style={{ width: "395px" }}><Spinner size={SpinnerSize.Small} /> loading...</div>) : (
    <>
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Settings Name:</span>
        <Select value={settingKey} onChange={_handleSettingsChange} style={{ width: "fit-content" }} options={settingsKeys} />
      </div>
      <Textarea rows={10} key="test" className="uicore-full-width" value={settingValue} onChange={_handleSettingsValueChange} />
      {showStatus()}
      <div style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {saveInProgress ?
          (<div ><Spinner size={SpinnerSize.Small} /> Saving...</div>) :
          <Button onClick={_saveSettings} disabled={!settingKey}>Save settings</Button>
        }
      </div>
      <DisabledText>Note: save does not work in this read-only environment.</DisabledText><br />
      <DisabledText>Forbidden error is expected.</DisabledText>
    </>
  );
};

