/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ClipPlane, ClipPrimitive, ClipVector, ConvexClipPlaneSet, Point3d, Transform, Vector3d } from "@bentley/geometry-core";
import { FeatureSymbology, GraphicBranch, IModelApp, RenderClipVolume, SceneContext, ScreenViewport, TiledGraphicsProvider, TileTreeReference, EditManipulator, Viewport } from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import * as React from "react";
import SwipingComparisonUI from "./SwipingComparisonUI";
import { Frustum, RenderMode } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";

export default class SwipingViewportApp implements SampleApp {

  /** Called by the showcase before the sample is started. */
  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void): Promise<React.ReactNode> {
    return <ViewportLoader iModelName={iModelName} setupControlPane={setupControlPane} />;
  }

  /** Called by the showcase before swapping to another sample. */
  public static teardown(): void {
  }

  public static getFrustum(vp: Viewport): Frustum {
    return vp.getFrustum().clone();
  }

  public static getClientRect(vp: ScreenViewport): ClientRect {
    return vp.getClientRect();
  }

  public static getWorldPoint(vp: Viewport, screenPoint: Point3d): Point3d {
    return vp.viewToWorld(screenPoint);
  }

  // TODO: Need better name than getNormal
  public static getNormal(vp: Viewport, screenPoint: Point3d): Vector3d {
    const point = this.getWorldPoint(vp, screenPoint);

    const boresite = EditManipulator.HandleUtils.getBoresite(point, vp);
    const viewY = vp.rotation.rowY();
    let normal = viewY.crossProduct(boresite.direction);
    // if (this.swapSides)
    //   normal = normal.negate();
    return normal;
  }
}
/** A simple component to load the viewport before starting the sample app. */
interface ViewportLoaderProps { iModelName: string; setupControlPane: (instructions: string, controls?: React.ReactNode) => void }
class ViewportLoader extends React.Component<ViewportLoaderProps, { viewport?: ScreenViewport }> {
  public state = { viewport: undefined };
  private _onIModelReady = () => {
    const vp = IModelApp.viewManager.selectedView;
    this.setState({ viewport: vp });
    if (undefined === vp)
      IModelApp.viewManager.onViewOpen.addOnce((args) => {
        this.setState({ viewport: args });
      });
  }

  public render() {
    return (<>
      <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
      {undefined !== this.state.viewport ? <SwipingComparisonUI viewport={this.state.viewport!} setupControlPane={this.props.setupControlPane} /> : <></>}
    </>);
  }
}

class BackgroundMapToggleProvider implements TiledGraphicsProvider {
  public clipVolume?: RenderClipVolume;

  constructor(clip: ClipVector) {
    this.clipVolume = IModelApp.renderSystem.createClipVolume(clip);
  }

  public dispose(): void {
    this.clipVolume?.dispose();
  }

  public forEachTileTreeRef(viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    viewport.view.forEachTileTreeRef(func);
  }

  public setClipVector(clip: ClipVector) {
    this.clipVolume = IModelApp.renderSystem.createClipVolume(clip);
  }

  public addToScene(output: SceneContext): void {

    // save view to replaces after comparison drawing
    const vp = output.viewport;
    const clip = vp.view.getViewClip();
    const renderMode: RenderMode = vp.viewFlags.renderMode;

    // update for comparison drawing
    vp.view.setViewClip(this.clipVolume?.clipVector);
    let vf = vp.viewFlags.clone();
    vf.renderMode = RenderMode.Wireframe;
    vp.viewFlags = vf;
    vp.synchWithView();

    const context = vp.createSceneContext();
    vp.view.createScene(context);

    const gfx = context.graphics;
    if (0 < gfx.length) {
      const ovrs = new FeatureSymbology.Overrides(vp);

      const branch = new GraphicBranch();
      branch.symbologyOverrides = ovrs;
      for (const gf of gfx)
        branch.entries.push(gf);

      output.outputGraphic(IModelApp.renderSystem.createGraphicBranch(branch, Transform.createIdentity(), { clipVolume: this.clipVolume }));
    }

    vp.view.setViewClip(clip);
    vf = vp.viewFlags.clone();
    vf.renderMode = renderMode;
    vp.viewFlags = vf;
    vp.synchWithView();
  }
}

export class TiledGraphicsOverrider {
  public provider: BackgroundMapToggleProvider | undefined;
  private _prevPoint: Point3d | undefined;

  constructor(private _viewport: ScreenViewport) { }

  private setBackgroundMap(enable: boolean) {
    const vf = this._viewport.viewFlags.clone();
    vf.backgroundMap = enable;
    this._viewport.viewFlags = vf;
  }

  public compare(screenPoint: Point3d) {
    this.setBackgroundMap(true);

    const vp = this._viewport;
    if (!vp.view.isSpatialView())
      return;

    this.updateProvider(screenPoint);

    vp.invalidateScene();
  }
  private createClip(vec: Vector3d, pt: Point3d) {
    const plane = ClipPlane.createNormalAndPoint(vec, pt)!;
    const planes = ConvexClipPlaneSet.createPlanes([plane]);
    return ClipVector.createCapture([ClipPrimitive.createCapture(planes)]);
  }

  public updateProvider(screenPoint: Point3d) {
    if (undefined === this.provider) {
      this.initProvider(screenPoint);
      this._viewport.synchWithView();
      return;
    }
    if (!this._prevPoint?.isAlmostEqual(screenPoint)) {
      const vp = this._viewport;
      const normal = SwipingViewportApp.getNormal(vp, screenPoint);
      const worldPoint = SwipingViewportApp.getWorldPoint(vp, screenPoint);
      const clip = this.createClip(normal.clone().negate(), worldPoint);
      this.provider.clipVolume?.dispose();
      this.provider.setClipVector(clip);
      this._viewport.view.setViewClip(this.createClip(normal.clone(), worldPoint));
      this._viewport.synchWithView();
    }
  }

  public initProvider(screenPoint: Point3d) {
    this._prevPoint = screenPoint;
    const vp = this._viewport;
    const normal = SwipingViewportApp.getNormal(this._viewport, screenPoint);

    this.provider = new BackgroundMapToggleProvider(this.createClip(normal.clone().negate(), SwipingViewportApp.getWorldPoint(this._viewport, screenPoint)));
    vp.addTiledGraphicsProvider(this.provider);
    vp.view.setViewClip(this.createClip(normal.clone(), SwipingViewportApp.getWorldPoint(this._viewport, screenPoint)));
    vp.viewFlags.clipVolume = true;
  }

  public clearProvider() {
    if (undefined === this.provider) return;
    const vp = this._viewport;
    vp.dropTiledGraphicsProvider(this.provider);
    this.provider.dispose();
    this.provider = undefined;
  }

  public clear() {
    const vp = this._viewport;
    this.clearProvider();
    vp.view.setViewClip(undefined);
    vp.synchWithView();
  }

}
