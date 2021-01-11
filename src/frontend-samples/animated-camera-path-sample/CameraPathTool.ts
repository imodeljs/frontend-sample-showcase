/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { BeButtonEvent, BeWheelEvent, EventHandled, PrimitiveTool, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { Angle, Matrix3d, Transform, Vector3d } from "@bentley/geometry-core";


export class CameraPathTool extends PrimitiveTool {
  public static toolId = "Test.DefineCamera";
  public static viewport: Viewport;
  public static keyDown: boolean = false;
  public static isMouseWheelEventActive: boolean = false;
  public static isMouseWheelAnimationActive: boolean = false;

  constructor() {
    super();
  }

  public isCompatibleViewport(vp: Viewport | undefined, isSelectedViewChange: boolean): boolean { return (super.isCompatibleViewport(vp, isSelectedViewChange) && undefined !== vp); }
  public requireWriteableTarget(): boolean { return false; } // Tool doesn't modify the imodel.
  public onRestartTool(): void { this.exitTool(); }

  public async onMiddleButtonDown(_ev: BeButtonEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onMouseWheel(_ev: BeWheelEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onMouseStartDrag(_ev: BeWheelEvent): Promise<EventHandled> {
    return EventHandled.Yes;
  }

  public async onDataButtonDown(_ev: BeWheelEvent): Promise<EventHandled> {
    CameraPathTool.keyDown = !CameraPathTool.keyDown;
    return EventHandled.Yes;
  }

  public async onMouseMotion(_ev: BeButtonEvent): Promise<void> {
    if (CameraPathTool.keyDown) {
      const viewRect = CameraPathTool.viewport.viewRect;
      const xExtent = viewRect.width;
      const yExtent = viewRect.height;
      const rotation = new Matrix3d();
      if (_ev.movement) {
        const xAngle = -(_ev.movement.x / xExtent * 2);
        const yAngle = -(_ev.movement.y / yExtent * 2);
        rotation.setFrom(CameraPathTool.viewport.rotation);
        const inverseRotation = rotation.inverse();
        const horizontalRotation = Matrix3d.createRotationAroundVector(Vector3d.unitZ(), Angle.createRadians(xAngle));
        const verticalRotation = Matrix3d.createRotationAroundVector(Vector3d.unitX(), Angle.createRadians(yAngle));
        if (verticalRotation && inverseRotation && horizontalRotation) {
          verticalRotation.multiplyMatrixMatrix(rotation, verticalRotation);
          inverseRotation.multiplyMatrixMatrix(verticalRotation, verticalRotation);
          const newRotation = horizontalRotation.multiplyMatrixMatrix(verticalRotation);
          const transform8 = Transform.createFixedPointAndMatrix((CameraPathTool.viewport.view as ViewState3d).camera.getEyePoint(), newRotation);
          const frustum = CameraPathTool.viewport.getFrustum().transformBy(transform8);
          CameraPathTool.viewport.setupViewFromFrustum(frustum);
        }
      }
    }
  }
}
