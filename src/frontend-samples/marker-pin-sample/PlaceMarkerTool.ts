/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeButtonEvent, EventHandled, IModelApp, PrimitiveTool, Viewport } from "@itwin/core-frontend";
import { Point3d } from "@itwin/core-geometry";

/** This class defines the user's interaction while placing a new marker. It is launched by a button in the UI.
 *  While it is active, the tool handles events from the user, notably mouse clicks in the viewport.
 */
export class PlaceMarkerTool extends PrimitiveTool {
  public static toolId = "Test.DefineLocation"; // <== Used to find flyover (tool name), description, and keyin from namespace tool registered with...see CoreTools.json for example...
  public static iconSpec = "icon-star"; // <== Tool button should use whatever icon you have here...
  private _createMarkerCallback: (pt: Point3d) => {};

  constructor(callback: (pt: Point3d) => {}) {
    super();

    this._createMarkerCallback = callback;
  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp && vp.view.isSpatialView()); }
  public isValidLocation(_ev: BeButtonEvent, _isButtonEvent: boolean): boolean { return true; } // Allow snapping to terrain, etc. outside project extents.
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public async onPostInstall() { await super.onPostInstall(); this.setupAndPromptForNextAction(); }
  public async onRestartTool(): Promise<void> { return this.exitTool(); }

  protected setupAndPromptForNextAction(): void {
    // Accusnap adjusts the effective cursor location to 'snap' to geometry in the view
    IModelApp.accuSnap.enableSnap(true);
  }

  // A reset button is the secondary action button, ex. right mouse button.
  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    void this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }

  // A data button is the primary action button, ex. left mouse button.
  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    if (undefined === ev.viewport)
      return EventHandled.No; // Shouldn't really happen

    // ev.point is the current world coordinate point adjusted for snap and locks
    this._createMarkerCallback(ev.point);

    void this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }
}
