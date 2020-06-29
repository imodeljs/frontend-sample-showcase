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

  public static iModelName: string;
  // Initialize the ConfigurableUiManager
  public static initialize() {
    ConfigurableUiManager.initialize();
    AppUi.defineFrontstages();
  }
  private static defineFrontstages() {

    ConfigurableUiManager.addFrontstageProvider(new StartupComponentFrontstage());
    ConfigurableUiManager.addFrontstageProvider(new SampleViewportFrontstage());
    ConfigurableUiManager.loadContentLayouts(AppUi.getContentLayouts());
    ConfigurableUiManager.loadContentGroups(AppUi.getContentGroups());
  }

  public static setIModelName (iModelName: string) {
    this.iModelName = iModelName;
  }
  public static async setFrontstage(frontStageName: string) {
    if (undefined === UiFramework.getIModelConnection())
      await FrontstageManager.setActiveFrontstage("StartupComponentFrontstage");
    await FrontstageManager.setActiveFrontstage(frontStageName);
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
          applicationData: { viewState: UiFramework.getDefaultViewState, iModelConnection: UiFramework.getIModelConnection},
        },
      ],
    };

    const startupComponent: ContentGroupProps = {
      id: "startupComponent",
      contents: [
        {
          classId: StartupComponentContentControl,
          id: "SampleShowcase.StartupComponentControl",
          applicationData: { iModelName: AppUi.iModelName},
        },
      ],
    };

    const contentGroups: ContentGroupProps[] = [];
    contentGroups.push(startupComponent, singleIModelViewport);
    return contentGroups;
  }
}
