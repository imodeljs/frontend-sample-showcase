/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d } from "@itwin/core-geometry";
import { BeButtonEvent, EventHandled, IModelApp, PrimitiveTool, Viewport } from "@itwin/core-frontend";

/** This class defines the user's interaction while interacting with the model and fire emitter.
 *  While it is active, the tool handles events from the user, notably mouse clicks in the viewport.
 */
export class PlacementTool extends PrimitiveTool {
  public static toolId = "Test.Placement"; // <== Used to find flyover (tool name), description, and keyin from namespace tool registered with...see CoreTools.json for example...
  public static iconSpec = "icon-star"; // <== Tool button should use whatever icon you have here...
  private _placementCallback: (pt: Point3d, viewport: Viewport) => void;

  constructor(callback: (pt: Point3d, vp: Viewport) => void) {
    super();

    this._placementCallback = callback;
  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp && vp.view.isSpatialView()); }
  public isValidLocation(_ev: BeButtonEvent, _isButtonEvent: boolean): boolean { return true; } // Allow snapping to terrain, etc. outside project extents.
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public async onPostInstall() { await super.onPostInstall(); IModelApp.accuSnap.enableSnap(true); }
  public async onRestartTool(): Promise<void> { return this.exitTool(); }

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
    this._placementCallback(ev.point, ev.viewport);

    void this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }
}
