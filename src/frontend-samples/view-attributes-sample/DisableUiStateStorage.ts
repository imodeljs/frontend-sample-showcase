import { UiStateStorage, UiStateStorageResult, UiStateStorageStatus } from "@itwin/core-react";

export class DisableUiStateStorage implements UiStateStorage {

  constructor(public w: Window = window) { }

  public async getSetting(_settingNamespace: string, _settingName: string): Promise<UiStateStorageResult> {
    return { status: UiStateStorageStatus.NotFound };
  }

  public async saveSetting(_settingNamespace: string, _settingName: string, _setting: any): Promise<UiStateStorageResult> {
    return { status: UiStateStorageStatus.Success };
  }

  public async hasSetting(settingNamespace: string, settingName: string): Promise<boolean> {
    const name = `${settingNamespace}.${settingName}`;
    const setting = this.w.localStorage.getItem(name);
    if (setting === null)
      return false;
    return true;
  }

  public async deleteSetting(settingNamespace: string, settingName: string): Promise<UiStateStorageResult> {
    const name = `${settingNamespace}.${settingName}`;
    const setting = this.w.localStorage.getItem(name);
    if (setting === null)
      return { status: UiStateStorageStatus.NotFound };
    this.w.localStorage.removeItem(name);
    return { status: UiStateStorageStatus.Success };
  }
}
