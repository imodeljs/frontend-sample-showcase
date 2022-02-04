/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { CommonToolbarItem, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsProvider } from "@itwin/appui-abstract";
import { IModelApp, NotifyMessageDetails, OutputMessagePriority } from "@itwin/core-frontend";

export class ToolbarButtonProvider implements UiItemsProvider {
  public readonly id = "ToolbarButtonProvider";
  /** provideToolbarButtonItems() is called for each registered UI provider as the Frontstage is building toolbars. We are adding an action button to the ContentManipulation Horizontal toolbar
   * in General use Frontstages. For more information, refer to the UiItemsProvider and Frontstage documentation on imodeljs.org.
   */
  public provideToolbarButtonItems(_stageId: string, stageUsage: string, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation): CommonToolbarItem[] {
    if (stageUsage === StageUsage.General && toolbarUsage === ToolbarUsage.ContentManipulation && toolbarOrientation === ToolbarOrientation.Horizontal) {
      const simpleActionSpec = ToolbarItemUtilities.createActionButton("Open message box", 1000, "icon-lightbulb", "Added Tool", () => this.startTool());
      return [simpleActionSpec];
    }
    return [];
  }
  public startTool() {
    IModelApp.notifications.outputMessage(new NotifyMessageDetails(OutputMessagePriority.Info, "Hello from the toolbar button you added."));
  }
}
