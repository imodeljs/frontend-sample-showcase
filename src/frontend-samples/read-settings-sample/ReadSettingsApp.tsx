/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { AuthorizedFrontendRequestContext, IModelApp } from "@bentley/imodeljs-frontend";
import { AuthorizedClientRequestContext } from "@bentley/itwin-client";

const namespace = "showcase";

export default class ReadSettingsApp {

  private static _requestContext: AuthorizedClientRequestContext;

  // Read settings from ProductSettingsService
  public static async readSettings(imodelId: string, projectId: string, settingName: string) {
    if (!ReadSettingsApp._requestContext) {
      ReadSettingsApp._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return IModelApp.settings.getSetting(ReadSettingsApp._requestContext, namespace, settingName, true, projectId, imodelId);
  }

  // The showcase does not have permission to write data, it is expected to fail with 403 Forbidden.
  // However saveSetting method will work in your project with signed-in user, who has required permissions in the project.
  public static async saveSettings(imodelId: string, projectId: string, settingName: string, settingValue: string) {
    if (!ReadSettingsApp._requestContext) {
      ReadSettingsApp._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return IModelApp.settings.saveSetting(ReadSettingsApp._requestContext, settingValue, namespace, settingName, true, projectId, imodelId);
  }
}
