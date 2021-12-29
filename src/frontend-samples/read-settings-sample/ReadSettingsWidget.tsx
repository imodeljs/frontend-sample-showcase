/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { ChangeEvent, useCallback, useEffect, useMemo } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Button, DisabledText, Select, SmallText, Spinner, SpinnerSize, Textarea } from "@itwin/core-react";
import { SettingsResult, SettingsStatus } from "@bentley/product-settings-client";
import ReadSettingsApi from "./ReadSettingsApi";
import "./ReadSettings.scss";

const ReadSettingsWidget: React.FunctionComponent = () => {
  const settingsKeys = useMemo(() => ["Json_Data", "Arbitrary_Text", "CSV_Data"], []);

  const iModelConnection = useActiveIModelConnection();
  const [settingKey, setSettingKey] = React.useState<string>(settingsKeys[0]);
  const [settingValue, setSettingValue] = React.useState<string>();
  const [settingResult, setSettingResult] = React.useState<SettingsResult>();
  const [saveInProgress, setSaveInProgress] = React.useState<boolean>(false);
  const [readUpdate, setReadUpdate] = React.useState<boolean>(true);
  const [saveUpdate, setSaveUpdate] = React.useState<boolean>(false);

  const _parseSettingsValue = useCallback((name: string, value: string) => {
    let _value;
    switch (name) {
      case settingsKeys[0]:
        _value = JSON.stringify(value || "", null, "   ");
        break;
      default:
        _value = value || "";
    }
    return _value;
  }, [settingsKeys]);

  /** iModelConnection react state is very sensitive and updates constantly, so readUpdate flag is introduced to only call the API once */
  useEffect(() => {
    if (iModelConnection && settingKey && readUpdate) {
      ReadSettingsApi.readSettings(iModelConnection.iModelId!, iModelConnection.iTwinId!, settingKey).then((response) => {
        setSettingResult(response);
        setSettingValue(_parseSettingsValue(settingKey, response.setting));
        setReadUpdate(false);
      })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  }, [_parseSettingsValue, iModelConnection, readUpdate, settingKey]);

  /** The showcase does not have permission to write data, it is expected to fail with 403 Forbidden. */
  useEffect(() => {
    if (iModelConnection && saveInProgress && settingValue && saveUpdate) {
      ReadSettingsApi.saveSettings(iModelConnection.iModelId!, iModelConnection.iTwinId!, settingKey, settingValue).then(() => {
        setSaveInProgress(false);
        setSaveUpdate(false);
      })
        .catch((error) => {
          // eslint-disable-next-line no-console
          console.error(error);
        });
    }
  }, [iModelConnection, saveInProgress, saveUpdate, settingKey, settingValue]);

  const _onSettingKeySelect = (event: ChangeEvent<HTMLSelectElement>) => {
    setSettingKey(event.target.value);
    setReadUpdate(true);
  };

  const _onSettingsValueChange = (event: any) => {
    setSettingValue(event.target.value);
    setSaveUpdate(true);
  };

  const _onSaveButtonPush = () => {
    setSaveInProgress(true);
    setSaveUpdate(true);
  };

  // Helper method to show status get/write operations with external setting in the dialog
  const _showStatus = useCallback(() => {
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
  }, [settingResult]);

  return (
    <div className="sample-options">
      {(settingValue === undefined) && (
        <div style={{ width: "395px" }}><Spinner size={SpinnerSize.Small} /> loading...</div>
      )}
      {(settingValue !== undefined) && (<>
        <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
          <span>Settings Name:</span>
          <Select value={settingKey} onChange={_onSettingKeySelect} style={{ width: "fit-content" }} options={settingsKeys} />
        </div>
        <Textarea rows={10} key="test" className="uicore-full-width" value={settingValue} onChange={_onSettingsValueChange} />
        {_showStatus()}
        <div style={{ height: "35px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {saveInProgress ?
            (<div ><Spinner size={SpinnerSize.Small} /> Saving...</div>) :
            <Button onClick={_onSaveButtonPush} disabled={!settingKey}>Save settings</Button>
          }
        </div>
        <DisabledText>Note: save does not work in this read-only environment.</DisabledText><br />
        <DisabledText>Forbidden error is expected.</DisabledText>
      </>
      )}
    </div>
  );
};

export class ReadSettingsWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ReadSettingsWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ReadSettingsWidget",
          label: "Read Settings Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ReadSettingsWidget />,
        }
      );
    }
    return widgets;
  }
}
