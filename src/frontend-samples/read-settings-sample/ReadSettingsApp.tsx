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

  private static async getRequestContext() {
    if (!ReadSettingsApp._requestContext) {
      ReadSettingsApp._requestContext = await AuthorizedFrontendRequestContext.create();
    }
    return ReadSettingsApp._requestContext;
  }

  // Read settings from ProductSettingsService
  public static async readSettings(imodelId: string, projectId: string, settingName: string) {
    const context = await this.getRequestContext();
    return IModelApp.settings.getSetting(context, namespace, settingName, true, projectId, imodelId);
  }

  // The showcase does not have permission to write data, it is expected to fail with 403 Forbidden.
  // However saveSetting method will work in your project with signed-in user, who has required permissions in the project.
  public static async saveSettings(imodelId: string, projectId: string, settingName: string, settingValue: string) {
    const context = await this.getRequestContext();
    return IModelApp.settings.saveSetting(context, settingValue, namespace, settingName, true, projectId, imodelId);
  }
}
