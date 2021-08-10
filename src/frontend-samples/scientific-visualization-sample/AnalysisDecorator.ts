import { assert } from "@bentley/bentleyjs-core";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { DecorateContext, Decorator, GraphicType, IModelApp, RenderGraphicOwner, Viewport } from "@bentley/imodeljs-frontend";
import { AnalysisMesh } from "./AnimationApi";

export class AnalysisDecorator implements Decorator {
  public readonly mesh: AnalysisMesh;
  private readonly _viewport: Viewport;
  private readonly _id: string;
  private _graphic?: RenderGraphicOwner;
  private _dispose?: () => void;
  public static decorator: AnalysisDecorator;

  public constructor(viewport: Viewport, mesh: AnalysisMesh) {
    this._viewport = viewport;
    this.mesh = mesh;
    this._id = viewport.iModel.transientIds.next;

    const removeDisposalListener = viewport.onDisposed.addOnce(() => this.dispose());
    const removeAnalysisStyleListener = viewport.addOnAnalysisStyleChangedListener(() => {
      // const removeAnalysisStyleListener = viewport.onDisplayStyleChanged.addListener(() => {
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
      builder.addPolyface(this.mesh.polyface, false);
      this._graphic = IModelApp.renderSystem.createGraphicOwner(builder.finish());
    }

    context.addDecoration(GraphicType.Scene, this._graphic);
  }
}
