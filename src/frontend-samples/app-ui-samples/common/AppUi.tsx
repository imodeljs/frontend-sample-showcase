/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ConfigurableUiManager, ContentGroupProps, ContentLayoutProps, FrontstageManager } from "@bentley/ui-framework";
import "./CubeContent";
import { SampleFrontstage } from "../../../Components/frontstages/SampleFrontstage";
import { IModelViewportControl } from "./IModelViewport";

/**
 * Example Ui Configuration for an iModel.js App
 */
export class AppUi {

  // Initialize the ConfigurableUiManager
  public static initialize() {
    ConfigurableUiManager.initialize();
    AppUi.defineFrontstages();

  }
  private static defineFrontstages() {

    ConfigurableUiManager.addFrontstageProvider(new SampleFrontstage());
    ConfigurableUiManager.loadContentLayouts(AppUi.getContentLayouts());
    ConfigurableUiManager.loadContentGroups(AppUi.getContentGroups());
  }

  public static async setFrontstage(frontStageName: string) {
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
    const cubeContentGroup: ContentGroupProps = {
      id: "CubeContentGroup",
      contents: [
        {
          classId: "CubeContent",
          applicationData: { label: "Content 1", bgColor: "black" },
        },
      ],
    };

    const singleIModelViewport: ContentGroupProps = {
      id: "singleIModelViewport",
      contents: [
        {
          classId: IModelViewportControl,
          id: "singleIModelView",
        },
      ],
    };


    const contentGroups: ContentGroupProps[] = [];
    contentGroups.push(cubeContentGroup);
    contentGroups.push(singleIModelViewport);
    return contentGroups;
  }
}
