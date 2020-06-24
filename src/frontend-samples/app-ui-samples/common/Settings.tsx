/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
/** @packageDocumentation
 * @module Settings
 */

import "./Settings.scss";
import * as React from "react";
import { Toggle } from "@bentley/ui-core";
import { ColorTheme, ModalFrontstageInfo, UiFramework} from "@bentley/ui-framework";

/** Modal frontstage displaying the active settings.
 * @alpha
 */
export class SettingsModalFrontstage implements ModalFrontstageInfo {
  public title: string = UiFramework.i18n.translate("Settings");
  public get content(): React.ReactNode { return (<SettingsPage />); }
}

/** SettingsPage displaying the active settings. */
class SettingsPageComponent extends React.Component {
  private _themeTitle: string = UiFramework.i18n.translate("Theme");
  private _themeDescription: string = UiFramework.i18n.translate("SampleApp:settingsStage.themeDescription");

  private _onThemeChange = async () => {
    const theme = this._isLightTheme() ? ColorTheme.Dark : ColorTheme.Light;
    UiFramework.setColorTheme(theme);
  }

  private _isLightTheme(): boolean {
    return (UiFramework.getColorTheme() === ColorTheme.Light);
  }


  public render(): React.ReactNode {
    const isLightTheme = this._isLightTheme();
    const darkLabel = UiFramework.i18n.translate("SampleApp:settingsStage.dark");
    const lightLabel = UiFramework.i18n.translate("SampleApp:settingsStage.light");

    return (
      <div className="uifw-settings">
        <div className="uifw-settings-item">
          <div className="panel left-panel">
            <span className="title">{this._themeTitle}</span>
            <span className="description">{this._themeDescription}</span>
          </div>
          <div className="panel right-panel">
            {darkLabel}
            &nbsp;
            <Toggle isOn={isLightTheme} showCheckmark={false} onChange={this._onThemeChange} />
            &nbsp;
            {lightLabel}
          </div>
        </div>
      </div>
    );
  }
}

// tslint:disable-next-line: variable-name
const SettingsPage = SettingsPageComponent;
