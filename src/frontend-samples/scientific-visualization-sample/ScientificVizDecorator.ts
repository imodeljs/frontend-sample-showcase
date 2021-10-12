/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { assert } from "@bentley/bentleyjs-core";
import { Polyface } from "@bentley/geometry-core";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicType, IModelApp, RenderGraphicOwner, Viewport } from "@bentley/imodeljs-frontend";

export class ScientificVizDecorator implements Decorator {
  public readonly polyface: Polyface;
  private readonly _viewport: Viewport;
  private readonly _id: string;
  private _graphic?: RenderGraphicOwner;
  private _dispose?: () => void;
  public static decorator: ScientificVizDecorator;

  public constructor(viewport: Viewport, polyface: Polyface) {
    this._viewport = viewport;
    this.polyface = polyface;
    this._id = viewport.iModel.transientIds.next;

    const removeDisposalListener = viewport.onDisposed.addOnce(() => this.dispose());
    const removeAnalysisStyleListener = viewport.addOnAnalysisStyleChangedListener(() => {
      this._graphic?.disposeGraphic();
      this._graphic = undefined;
    });

    this._dispose = () => {
      removeAnalysisStyleListener();
      removeDisposalListener();
    };

    IModelApp.viewManager.addDecorator(this);
  }

  public dispose(): void {
    if (!this._dispose) {
      assert(undefined === this._graphic);
      return;
    }

    this._graphic?.disposeGraphic();
    this._graphic = undefined;
    this._dispose();
    this._dispose = undefined;
    IModelApp.viewManager.dropDecorator(this);
  }

  public decorate(context: DecorateContext): void {
    if (context.viewport !== this._viewport)
      return;

    if (!this._graphic) {
      const builder = context.createGraphicBuilder(GraphicType.Scene, undefined, this._id);
      const color = ColorDef.fromTbgr(ColorByName.darkSlateBlue);
      builder.setSymbology(color, color, 1);
      builder.addPolyface(this.polyface, false);
      this._graphic = IModelApp.renderSystem.createGraphicOwner(builder.finish());
    }

    context.addDecoration(GraphicType.Scene, this._graphic);
  }
}
