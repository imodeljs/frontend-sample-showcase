/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ColorDef } from "@itwin/core-common";
import { BeButton, BeButtonEvent, EventHandled, IModelApp, InputCollector, Marker } from "@itwin/core-frontend";
import { Point3d, XAndY } from "@itwin/core-geometry";

export class InteractivePointMarker extends Marker {
  private _color: ColorDef;
  private _canPick: boolean;
  private _setPointFunc: (pt: Point3d) => void;

  constructor(location: Point3d, title: string, color: ColorDef, setPointFunc: (pt: Point3d) => void) {
    super(location, { x: 8, y: 8 });  // 8x8 is the marker size

    // The title will be shown as a tooltip when the user interacts with the marker
    this.title = title;

    // Function to be called when the marker is moved
    this._setPointFunc = setPointFunc;

    // When true, the marker will react to mouse
    this._canPick = true;

    this._color = color;
  }

  public pick(pt: XAndY): boolean {
    if (this._canPick)
      return super.pick(pt);

    return false;
  }

  public onMouseButton(ev: BeButtonEvent) {
    if (BeButton.Data === ev.button && ev.isDown) {
      this._canPick = false;
      void IModelApp.tools.run(MovePointTool.toolId, this.worldLocation, this._setPointFunc, () => { this._canPick = true; });
      return true;
    }
    return false;
  }

  /** Show the cluster as a white circle with a thick outline */
  public drawFunc(ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.strokeStyle = "#372528";
    ctx.fillStyle = this._color.toRgbString();
    ctx.lineWidth = 1;
    ctx.arc(0, 0, this.size.x, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.strokeStyle = "#372528";
    ctx.fillStyle = "black";
    ctx.lineWidth = 1;
    ctx.arc(0, 0, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  }
}

export class MovePointTool extends InputCollector {
  public static toolId = "MovePointTool";
  private _resetPt: Point3d;
  private _setPointFunc: (pt: Point3d) => void;
  private _toolCompleteFunc: () => void;

  constructor(resetPt: Point3d, setPoint: (pt: Point3d) => void, toolComplete: () => void) {
    super();
    this._resetPt = resetPt.clone();
    this._setPointFunc = setPoint;
    this._toolCompleteFunc = toolComplete;
  }

  public async onMouseMotion(ev: BeButtonEvent) {
    this._setPointFunc(ev.point);
  }

  public async onDataButtonDown(ev: BeButtonEvent) {
    this._setPointFunc(ev.point);
    this._toolCompleteFunc();
    void this.exitTool();
    return EventHandled.Yes;
  }

  public async onResetButtonUp(_ev: BeButtonEvent) {
    this._setPointFunc(this._resetPt);
    this._toolCompleteFunc();
    return super.onResetButtonUp(_ev);
  }
}
