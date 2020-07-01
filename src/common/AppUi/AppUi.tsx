/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ConfigurableUiManager, ContentGroupProps, ContentLayoutProps, FrontstageManager, IModelViewportControl, UiFramework } from "@bentley/ui-framework";
import { StartupComponentContentControl } from "./StartupComponentContentControl";
import { SampleViewportFrontstage } from "../../Components/frontstages/SampleViewportFrontstage";
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
    }
  }
  public static restoreDefaults() {
    const frontstageDef = FrontstageManager.activeFrontstageDef;
    frontstageDef && frontstageDef.restoreLayout();
  }

  public static get iModelName () {
    return this._iModelName;
  }
  public static get frontstageId () {
    return this._frontstageId;
  }
  private static defineFrontstages() {

    ConfigurableUiManager.addFrontstageProvider(new StartupComponentFrontstage());
    ConfigurableUiManager.addFrontstageProvider(new SampleViewportFrontstage());
    ConfigurableUiManager.loadContentLayouts(AppUi.getContentLayouts());
    ConfigurableUiManager.loadContentGroups(AppUi.getContentGroups());
  }

  public static async setFrontstage(iModelName: string, frontStageName: string) {
    this._frontstageId = frontStageName;
    if (iModelName !== this._iModelName) {
      this._iModelName = iModelName;
      await FrontstageManager.setActiveFrontstage("StartupComponentFrontstage")
    } else {
      await FrontstageManager.setActiveFrontstage(frontStageName);
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
    const singleIModelViewport: ContentGroupProps = {
      id: "singleIModelViewport",
      contents: [
        {
          classId: IModelViewportControl,
          id: "singleIModelView",
          applicationData: { viewState: UiFramework.getDefaultViewState, iModelConnection: UiFramework.getIModelConnection },
        },
      ],
    };

    const startupComponent: ContentGroupProps = {
      id: "startupComponent",
      contents: [
        {
          classId: StartupComponentContentControl,
          id: "SampleShowcase.StartupComponentControl",
          applicationData: { iModelName: AppUi.iModelName, frontstageId: AppUi.frontstageId },
        },
      ],
    };

    const contentGroups: ContentGroupProps[] = [];
    contentGroups.push(startupComponent, singleIModelViewport);
    return contentGroups;
  }
}
