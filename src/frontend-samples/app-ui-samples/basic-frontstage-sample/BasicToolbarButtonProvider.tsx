import { CommonToolbarItem, StageUsage, ToolbarItemUtilities, ToolbarOrientation, ToolbarUsage, UiItemsProvider } from "@bentley/ui-abstract";
import { FitViewTool, IModelApp } from "@bentley/imodeljs-frontend";

export class BasicToolbarButtonProvider implements UiItemsProvider {
  public readonly id = "BasicToolbarButtonProvider";

/** provideToolbarButtonItems() is called for each registered UI provider as the Frontstage is building toolbars. We are adding an action button to the ContentManipulation Horizontal toolbar
 * in General use Frontstages. For more information, refer to the UiItemsProvider and Frontstage documentation on imodeljs.org.
 */
  public provideToolbarButtonItems(_stageId: string, stageUsage: StageUsage, toolbarUsage: ToolbarUsage, toolbarOrientation: ToolbarOrientation): CommonToolbarItem[] {
    if (stageUsage === StageUsage.General && toolbarUsage === ToolbarUsage.ContentManipulation && toolbarOrientation === ToolbarOrientation.Horizontal) {
      const simpleActionSpec = ToolbarItemUtilities.createActionButton(FitViewTool.flyover, 1000, "icon-fit-to-view", "Fit View Tool", this.startTool);
      return [simpleActionSpec];
    }
    return [];
  }

  public startTool() {
    IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView);
  }
}
