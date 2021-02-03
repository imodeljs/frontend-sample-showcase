/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeButtonEvent, BeWheelEvent, EventHandled, PrimitiveTool, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { Angle, Matrix3d, Transform, Vector3d } from "@bentley/geometry-core";


export class CameraPathTool extends PrimitiveTool {
  public static toolId = "Test.DefineCamera";
  private _keyDown: boolean = false;
  private _mouseScrollCallback: (deltaY: number) => {};
  private _mouseDataButtonDownCallback: (keyDown: boolean) => {};

  constructor(mouseScrollCallback: (deltaY: number) => {}, mouseDataButtonDownCallback: (key: boolean) => {}) {
    super();
    this._mouseScrollCallback = mouseScrollCallback;
    this._mouseDataButtonDownCallback = mouseDataButtonDownCallback;
  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp); }
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public onRestartTool(): void { this.exitTool(); }

  public async onMiddleButtonDown(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onMouseWheel(_ev: BeWheelEvent): Promise<EventHandled> {
    this._mouseScrollCallback(_ev.wheelDelta);
    return EventHandled.Yes;
  }

  public async onMouseStartDrag(_ev: BeWheelEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onDataButtonDown(_ev: BeWheelEvent): Promise<EventHandled> {
    this._keyDown = !this._keyDown;
    this._mouseDataButtonDownCallback(this._keyDown);
    return EventHandled.Yes;
  }

  public async onMouseMotion(_ev: BeButtonEvent): Promise<void> {
    if (this._keyDown) {
      if (_ev.viewport === undefined)
        return;
      const viewRect = _ev.viewport.viewRect;
      const xExtent = viewRect.width;
      const yExtent = viewRect.height;
      const rotation = new Matrix3d();
      if (_ev.movement) {
        const xAngle = -(_ev.movement.x / xExtent * 2);
        const yAngle = -(_ev.movement.y / yExtent * 2);
        rotation.setFrom(_ev.viewport.rotation);
        const inverseRotation = rotation.inverse();
        const horizontalRotation = Matrix3d.createRotationAroundVector(Vector3d.unitZ(), Angle.createRadians(xAngle));
        const verticalRotation = Matrix3d.createRotationAroundVector(Vector3d.unitX(), Angle.createRadians(yAngle));
        if (verticalRotation && inverseRotation && horizontalRotation) {
          verticalRotation.multiplyMatrixMatrix(rotation, verticalRotation);
          inverseRotation.multiplyMatrixMatrix(verticalRotation, verticalRotation);
          const newRotation = horizontalRotation.multiplyMatrixMatrix(verticalRotation);
          const transform8 = Transform.createFixedPointAndMatrix((_ev.viewport.view as ViewState3d).camera.getEyePoint(), newRotation);
          const frustum = _ev.viewport.getFrustum().transformBy(transform8);
          _ev.viewport.setupViewFromFrustum(frustum);
        }
      }
    }
  }

  public async onTouchMoveStart(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onTouchTap(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }
}
