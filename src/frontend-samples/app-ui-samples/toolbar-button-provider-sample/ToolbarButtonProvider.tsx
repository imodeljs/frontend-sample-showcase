import { CommonToolbarItem, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsProvider } from "@bentley/ui-abstract";
import { IModelApp } from "@bentley/imodeljs-frontend";

export class ToolbarButtonProvider implements UiItemsProvider {
  public readonly id = "ToolbarButtonProvider";
  /** provideToolbarButtonItems() is called for each registered UI provider as the Frontstage is building toolbars. We are adding an action button to the ContentManipulation Horizontal toolbar
   * in General use Frontstages. For more information, refer to the UiItemsProvider and Frontstage documentation on imodeljs.org.
   */
  public provideToolbarButtonItems(_stageId: string, stageUsage: string, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation): CommonToolbarItem[] {
    if (stageUsage === StageUsage.General && toolbarUsage === ToolbarUsage.ContentManipulation && toolbarOrientation === ToolbarOrientation.Horizontal) {
      const simpleActionSpec = ToolbarItemUtilities.createActionButton("Open message box", 1000, "icon-lightbulb", "Message", this.startTool);
      return [simpleActionSpec];
    }
    return [];
  }
  public startTool() {
    //const msg = new NotifyMessageDetails(OutputMessagePriority.Info, "Hi", "Hello from the toolbar button you added", OutputMessageType.Toast, OutputMessageAlert.Balloon);
    IModelApp.notifications.outputPrompt("Hi from your added toolbar button");
  }
}
