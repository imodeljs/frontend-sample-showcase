/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeButtonEvent, EventHandled, IModelApp, PrimitiveTool, Viewport } from "@bentley/imodeljs-frontend";
import { Point3d } from "@bentley/geometry-core";
import FireDecorationApp from "./ParticleSampleApp";

/** This class defines the user's interaction while interacting with the model and fire emitter.
 *  While it is active, the tool handles events from the user, notably mouse clicks in the viewport.
 */
export class PlacementTool extends PrimitiveTool {
  public static toolId = "Test.Placement"; // <== Used to find flyover (tool name), description, and keyin from namespace tool registered with...see CoreTools.json for example...
  public static iconSpec = "icon-star"; // <== Tool button should use whatever icon you have here...
  private _createMarkerCallback: (pt: Point3d) => {};

  constructor(public highlightOnHover: boolean, callback: (pt: Point3d) => {}) {
    super();

    this._createMarkerCallback = callback;
  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp && vp.view.isSpatialView()); }
  public isValidLocation(_ev: BeButtonEvent, _isButtonEvent: boolean): boolean { return true; } // Allow snapping to terrain, etc. outside project extents.
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public onPostInstall() { super.onPostInstall(); IModelApp.accuSnap.enableSnap(true); }
  public onRestartTool(): void { this.exitTool(); }

  // A reset button is the secondary action button, ex. right mouse button.
  public async onResetButtonUp(_ev: BeButtonEvent): Promise<EventHandled> {
    this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }

  public async onMouseMotion(ev: BeButtonEvent) {
    if (this.highlightOnHover) {
      const emitter = FireDecorationApp.getClosestEmitter(ev.point);

      FireDecorationApp.highlightEmitter(emitter);
      ev.viewport?.invalidateDecorations();
    }
  }

  // A data button is the primary action button, ex. left mouse button.
  public async onDataButtonDown(ev: BeButtonEvent): Promise<EventHandled> {
    if (undefined === ev.viewport)
      return EventHandled.No; // Shouldn't really happen

    // ev.point is the current world coordinate point adjusted for snap and locks
    this._createMarkerCallback(ev.point);

    this.onReinitialize(); // Calls onRestartTool to exit
    return EventHandled.No;
  }
}