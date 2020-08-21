/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ClipPlane, ClipPrimitive, ClipVector, ConvexClipPlaneSet, Point3d, Transform, Vector3d } from "@bentley/geometry-core";
import { Frustum, RenderMode, ViewFlagOverrides } from "@bentley/imodeljs-common";
import { EditManipulator, FeatureSymbology, GraphicBranch, IModelApp, RenderClipVolume, SceneContext, ScreenViewport, TiledGraphicsProvider, TileTreeReference, Viewport } from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import * as React from "react";
import SwipingComparisonUI from "./SwipingComparisonUI";

export default class SwipingViewportApp implements SampleApp {
  private static _provider: ComparisonProvider | undefined;
  private static _prevPoint?: Point3d;
  private static _viewport?: Viewport;

  /** Called by the showcase before the sample is started. */
  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {
    return <SwipingComparisonUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** Called by the showcase before swapping to another sample. */
  public static teardown(): void {
    if (undefined !== SwipingViewportApp._viewport && undefined !== SwipingViewportApp._provider) {
      SwipingViewportApp.disposeProvider(SwipingViewportApp._viewport, SwipingViewportApp._provider);
      SwipingViewportApp._provider = undefined;
    }
    if (undefined !== SwipingViewportApp._viewport) {
      SwipingViewportApp._viewport.view.setViewClip(undefined);
      SwipingViewportApp._viewport.synchWithView();
      SwipingViewportApp._viewport = undefined;
    }
    SwipingViewportApp._prevPoint = undefined;
  }

  /** Gets the selected viewport using the IModelApp API. */
  public static getSelectedViewport(): ScreenViewport | undefined {
    return IModelApp.viewManager.selectedView;
  }

  /** Adds a listener that will be triggered only once for the next opened view.  Returns a functions to remove that listener. */
  public static listenOnceForViewOpen(onOpen: (viewport: ScreenViewport) => void): () => void {
    return IModelApp.viewManager.onViewOpen.addOnce(onOpen);
  }

  /** Adds a listener that will be triggered when the viewport is updated. Returns a functions to remove that listener. */
  public static listerForViewportUpdate(viewport: Viewport, onUpdate: (viewport: Viewport) => void): () => void {
    // There is event in the viewport called onViewChanged.  As stated in the js docs, the function is invoked, VERY frequently.
    //  Using that event when doing heavy changes in that event, performance can start to suffer.
    return viewport.onRender.addListener(onUpdate);
  }

  /** Get the frustum of the camera using the viewport API. */
  public static getFrustum(vp: Viewport): Frustum {
    return vp.getFrustum().clone();
  }

  /** Get the rectangle defining the area of the HTML canvas using the viewport API. */
  public static getClientRect(vp: ScreenViewport): ClientRect {
    return vp.getClientRect();
  }

  /** Convert a point in the view space to the world space using the viewport API. */
  public static getWorldPoint(vp: Viewport, screenPoint: Point3d): Point3d {
    return vp.viewToWorld(screenPoint);
  }

  /** Return a vector perpendicular to the view considering the camera's perspective. */
  public static getPerpendicularNormal(vp: Viewport, screenPoint: Point3d): Vector3d {
    const point = SwipingViewportApp.getWorldPoint(vp, screenPoint);

    const boresite = EditManipulator.HandleUtils.getBoresite(point, vp);
    const viewY = vp.rotation.rowY();
    const normal = viewY.crossProduct(boresite.direction);
    return normal;
  }

  /** Will create an effect allowing for different views on either side of an arbitrary point in the view space.  This will allows us to compare the effect the views have on the iModel. */
  public static compare(screenPoint: Point3d, viewport: Viewport) {
    if (viewport.viewportId !== SwipingViewportApp._viewport?.viewportId)
      SwipingViewportApp.teardown();
    SwipingViewportApp._viewport = viewport;
    const provider = SwipingViewportApp._provider;
    const vp = viewport;
    if (!vp.view.isSpatialView())
      return;

    if (undefined === provider) {
      SwipingViewportApp.initProvider(screenPoint, viewport);
      vp.synchWithView();
    } else if (!SwipingViewportApp._prevPoint?.isAlmostEqual(screenPoint)) {
      SwipingViewportApp.updateProvider(screenPoint, viewport, provider);
    }
    vp.invalidateScene();
  }

  /** Creates a [ClipVector] based on the arguments. */
  private static createClip(vec: Vector3d, pt: Point3d): ClipVector {
    const plane = ClipPlane.createNormalAndPoint(vec, pt)!;
    const planes = ConvexClipPlaneSet.createPlanes([plane]);
    return ClipVector.createCapture([ClipPrimitive.createCapture(planes)]);
  }

  /** Updates the location of the clipping plane in both the provider and viewport. */
  private static updateProvider(screenPoint: Point3d, viewport: Viewport, provider: ComparisonProvider) {
    // Update Clipping plane in provider and in the view.
    const vp = viewport;
    const normal = SwipingViewportApp.getPerpendicularNormal(vp, screenPoint);
    const worldPoint = SwipingViewportApp.getWorldPoint(vp, screenPoint);
    const clip = SwipingViewportApp.createClip(normal.clone().negate(), worldPoint);

    provider.clipVolume?.dispose();
    provider.setClipVector(clip);

    viewport.view.setViewClip(SwipingViewportApp.createClip(normal.clone(), worldPoint));
    viewport.synchWithView();
  }

  /** Creates a [TiledGraphicsProvider] and adds it to the viewport.  This also sets the clipping plane used for the comparison. */
  private static initProvider(screenPoint: Point3d, viewport: Viewport) {
    SwipingViewportApp._prevPoint = screenPoint;
    const vp = viewport;
    const normal = SwipingViewportApp.getPerpendicularNormal(viewport, screenPoint);

    // Note the normal is negated, this is flip the clipping plane created from it.
    const negatedClip = SwipingViewportApp.createClip(normal.clone().negate(), SwipingViewportApp.getWorldPoint(viewport, screenPoint));
    SwipingViewportApp._provider = new ComparisonProvider(negatedClip);
    vp.addTiledGraphicsProvider(SwipingViewportApp._provider);

    // Note the normal is NOT negated.  These opposite facing clipping planes will create a effect we can use to compare views.
    const clip = SwipingViewportApp.createClip(normal.clone(), SwipingViewportApp.getWorldPoint(viewport, screenPoint));
    vp.view.setViewClip(clip);
    vp.viewFlags.clipVolume = true;
  }

  /** Removes the provider from the viewport, and disposed of any resources it has. */
  private static disposeProvider(viewport: Viewport, provider: ComparisonProvider) {
    viewport.dropTiledGraphicsProvider(provider);
    // Not all [TiledGraphicsProvider] are disposable.
    provider.dispose();
  }
}

class ComparisonProvider implements TiledGraphicsProvider {
  public clipVolume: RenderClipVolume | undefined;
  public viewFlagOverrides = new ViewFlagOverrides();

  constructor(clip: ClipVector) {
    // Create the objects that will be used later by the "addToScene" method.
    this.setClipVector(clip);
    this.viewFlagOverrides.setRenderMode(RenderMode.Wireframe);
  }

  /** Apply the supplied function to each [[TileTreeReference]] to be drawn in the specified [[Viewport]]. */
  public forEachTileTreeRef(viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    viewport.view.forEachTileTreeRef(func);
  }

  /** Overrides the logic for adding this provider's graphics into the scene. */
  public addToScene(output: SceneContext): void {

    // Save view to be replaced after comparison is drawn
    const vp = output.viewport;
    const clip = vp.view.getViewClip();

    // Replace the clipping plane with a flipped one.
    vp.view.setViewClip(this.clipVolume?.clipVector);  // TODO: Have Paul review

    const context = vp.createSceneContext();
    vp.view.createScene(context);

    // This graphics branch contains the graphics that were excluded by the flipped clipping plane
    const gfx = context.graphics;
    if (0 < gfx.length) {
      const ovrs = new FeatureSymbology.Overrides(vp);

      const branch = new GraphicBranch();
      branch.symbologyOverrides = ovrs;
      for (const gf of gfx)
        branch.entries.push(gf);

      // Overwrites the view flags for this view branch.
      branch.setViewFlagOverrides(this.viewFlagOverrides);
      // Draw the graphics to the screen.
      output.outputGraphic(IModelApp.renderSystem.createGraphicBranch(branch, Transform.createIdentity(), { clipVolume: this.clipVolume }));
    }

    // Return the old clip to the view.
    vp.view.setViewClip(clip);
  }

  /** The clip vector passed in should be flipped with respect to the normally applied clip vector.
   * It could be calculated in the "addToScene(...)" but we want to optimize that method.
   */
  public setClipVector(clipVector: ClipVector): void {
    this.clipVolume = IModelApp.renderSystem.createClipVolume(clipVector);
  }

  /** Disposes of any WebGL resources owned by this volume. */
  public dispose(): void {
    this.clipVolume?.dispose();
  }
}
