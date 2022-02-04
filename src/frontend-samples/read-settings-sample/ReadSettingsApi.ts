/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { IModelApp } from "@itwin/core-frontend";

const namespace = "showcase";

export default class ReadSettingsApi {

  private static _accessToken: string;

  // Read settings from ProductSettingsService
  public static async readSettings(iModelId: string, projectId: string, settingName: string) {
    return IModelApp.userPreferences!.get({ accessToken: ReadSettingsApi._accessToken, namespace, key: settingName, iTwinId: projectId, iModelId });
  }

  // The showcase does not have permission to write data, it is expected to fail with 403 Forbidden.
  // However saveSetting method will work in your project with signed-in user, who has required permissions in the project.
  public static async saveSettings(iModelId: string, projectId: string, settingName: string, settingValue: string) {
    return IModelApp.userPreferences!.save({ accessToken: ReadSettingsApi._accessToken, content: settingValue, namespace, key: settingName, iTwinId: projectId, iModelId });
  }
}
