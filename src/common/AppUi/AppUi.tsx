/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ConfigurableUiManager, ContentGroupProps, ContentLayoutProps, FrontstageManager } from "@bentley/ui-framework";
import { StartupComponentContentControl } from "./StartupComponentContentControl";
import { ViewportFrontstage } from "../../Components/frontstages/ViewportFrontstage";
import { StartupComponentFrontstage } from "../../Components/frontstages/StartupComponentFrontstage";

/**
 * Example Ui Configuration for an iModel.js App
 */
export class AppUi {
  public static initialized: boolean = false;
  private static _iModelName: string;
  private static _frontstageId: string;
  // Initialize the ConfigurableUiManager
  public static initialize() {
    if (!this.initialized) {
      this.initialized = true;
      ConfigurableUiManager.initialize();
      AppUi.defineFrontstages();
      this._frontstageId = "ViewportFrontstage"; // default frontstage id
    }
  }
  public static restoreDefaults() {
    const frontstageDef = FrontstageManager.activeFrontstageDef;
    frontstageDef && frontstageDef.restoreLayout();
  }

  public static get iModelName() {
    return this._iModelName;
  }
  public static get frontstageId() {
    return this._frontstageId;
  }
  private static defineFrontstages() {

    ConfigurableUiManager.addFrontstageProvider(new StartupComponentFrontstage());
    ConfigurableUiManager.addFrontstageProvider(new ViewportFrontstage());
    ConfigurableUiManager.loadContentLayouts(AppUi.getContentLayouts());
    ConfigurableUiManager.loadContentGroups(AppUi.getContentGroups());
  }

  public static async activateFrontstage(frontstageId?: string) {
    await FrontstageManager.setActiveFrontstage(undefined === frontstageId ? this._frontstageId : frontstageId);
  }
  public static async setIModelAndFrontstage(iModelName?: string, frontstageId?: string) {
    if (undefined !== frontstageId)
      this._frontstageId = frontstageId;
    if (undefined !== iModelName && iModelName !== this._iModelName) {
      this._iModelName = iModelName;
      await FrontstageManager.setActiveFrontstage("StartupComponentFrontstage")
    } else {
      await this.activateFrontstage(this._frontstageId);
    }
  }

  private static getContentLayouts(): ContentLayoutProps[] {

    const singleContent: ContentLayoutProps = {
      id: "SingleContent",
    };

    const contentLayouts: ContentLayoutProps[] = [];
    // in order to pick out by number of views for convenience.
    contentLayouts.push(singleContent);
    return contentLayouts;
  }

  public static findLayoutFromContentCount(contentCount: number): ContentLayoutProps | undefined {
    const contentLayouts: ContentLayoutProps[] = AppUi.getContentLayouts();
    if (contentCount <= 4)
      return contentLayouts[contentCount - 1];
    return undefined;
  }

  private static getContentGroups(): ContentGroupProps[] {
    const startupComponent: ContentGroupProps = {
      id: "startupComponent",
      contents: [
        {
          classId: StartupComponentContentControl,
          id: "SampleShowcase.StartupComponentControl",
        },
      ],
    };

    const contentGroups: ContentGroupProps[] = [];
    contentGroups.push(startupComponent);
    return contentGroups;
  }
}
