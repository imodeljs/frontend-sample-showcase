/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ClipPlane, ClipPrimitive, ClipVector, ConvexClipPlaneSet, Point3d, Transform, Vector3d } from "@bentley/geometry-core";
import { ContextRealityModelProps, FeatureAppearance, Frustum, RenderMode, ViewFlagOverrides } from "@bentley/imodeljs-common";
import { EditManipulator, FeatureSymbology, findAvailableUnattachedRealityModels, GraphicBranch, IModelApp, IModelConnection, RenderClipVolume, SceneContext, ScreenViewport, TiledGraphicsProvider, TileTreeReference, Viewport } from "@bentley/imodeljs-frontend";

export enum ComparisonType {
  Wireframe,
  RealityData,
}

export default class SwipingViewportApp {
  private static _provider: SampleTiledGraphicsProvider | undefined;
  private static _prevPoint?: Point3d;
  private static _viewport?: Viewport;

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
  public static compare(screenPoint: Point3d, viewport: Viewport, comparisonType: ComparisonType) {
    if (viewport.viewportId !== SwipingViewportApp._viewport?.viewportId)
      SwipingViewportApp.teardown();
    SwipingViewportApp._viewport = viewport;
    const provider = SwipingViewportApp._provider;
    const vp = viewport;
    if (!vp.view.isSpatialView())
      return;

    if (undefined !== provider && provider.comparisonType !== comparisonType) {
      SwipingViewportApp.disposeProvider(SwipingViewportApp._viewport, SwipingViewportApp._provider!);
      SwipingViewportApp._provider = undefined;
    }

    let didInit = false;
    if (undefined === SwipingViewportApp._provider) {
      didInit = true;
      SwipingViewportApp._provider = SwipingViewportApp.createProvider(screenPoint, viewport, comparisonType);
      vp.addTiledGraphicsProvider(SwipingViewportApp._provider);
    }
    if (didInit || !SwipingViewportApp._prevPoint?.isAlmostEqual(screenPoint))
      SwipingViewportApp.updateProvider(screenPoint, viewport, SwipingViewportApp._provider);
  }

  /** Creates a [ClipVector] based on the arguments. */
  private static createClip(vec: Vector3d, pt: Point3d): ClipVector {
    const plane = ClipPlane.createNormalAndPoint(vec, pt)!;
    const planes = ConvexClipPlaneSet.createPlanes([plane]);
    return ClipVector.createCapture([ClipPrimitive.createCapture(planes)]);
  }

  /** Updates the location of the clipping plane in both the provider and viewport. */
  private static updateProvider(screenPoint: Point3d, viewport: Viewport, provider: SampleTiledGraphicsProvider) {
    // Update Clipping plane in provider and in the view.
    const vp = viewport;
    const normal = SwipingViewportApp.getPerpendicularNormal(vp, screenPoint);
    const worldPoint = SwipingViewportApp.getWorldPoint(vp, screenPoint);

    // Update in Provider
    const clip = SwipingViewportApp.createClip(normal.clone().negate(), worldPoint);
    provider.clipVolume?.dispose();
    provider.setClipVector(clip);

    // Update in Viewport
    viewport.view.setViewClip(SwipingViewportApp.createClip(normal.clone(), worldPoint));
    viewport.synchWithView();
  }

  /** Creates a [TiledGraphicsProvider] and adds it to the viewport.  This also sets the clipping plane used for the comparison. */
  private static createProvider(screenPoint: Point3d, viewport: Viewport, type: ComparisonType): SampleTiledGraphicsProvider {
    SwipingViewportApp._prevPoint = screenPoint;
    const normal = SwipingViewportApp.getPerpendicularNormal(viewport, screenPoint);
    let rtnProvider;

    // Note the normal is negated, this is flip the clipping plane created from it.
    const negatedClip = SwipingViewportApp.createClip(normal.clone().negate(), SwipingViewportApp.getWorldPoint(viewport, screenPoint));
    switch (type) {
      case ComparisonType.Wireframe:
      default:
        rtnProvider = new ComparisonWireframeProvider(negatedClip);
        break;
      case ComparisonType.RealityData:
        rtnProvider = new ComparisonRealityModelProvider(negatedClip);
        break;
    }
    return rtnProvider;
  }

  /** Removes the provider from the viewport, and disposed of any resources it has. */
  private static disposeProvider(viewport: Viewport, provider: SampleTiledGraphicsProvider) {
    viewport.dropTiledGraphicsProvider(provider);
    // Not all [TiledGraphicsProvider] are disposable the ones used in this sample are.
    provider.dispose();
  }

  /** Get all available reality models and attach them to displayStyle. */
  public static async attachRealityData(viewport: Viewport, imodel: IModelConnection) {
    const style = viewport.displayStyle.clone();
    const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
    for (const crmProp of availableModels) {
      style.attachRealityModel(crmProp);
      viewport.displayStyle = style;
    }
  }

  /** Set the transparency of the reality models using the Feature Override API. */
  public static setRealityModelTransparent(vp: Viewport, transparency: boolean | undefined): void {
    const override = { transparency: (transparency ?? false) ? 1.0 : 0.0 };
    const style = vp.displayStyle.clone();
    let index = 0;
    style.forEachRealityModel((_model) => {
      const existingOverrides = vp.getRealityModelAppearanceOverride(index);
      vp.overrideRealityModelAppearance(index, existingOverrides ? existingOverrides.clone(override) : FeatureAppearance.fromJSON(override));
      index++;
    });
  }
}

abstract class SampleTiledGraphicsProvider implements TiledGraphicsProvider {
  public readonly abstract comparisonType: ComparisonType;
  public viewFlagOverrides = new ViewFlagOverrides();
  public clipVolume: RenderClipVolume | undefined;
  constructor(clipVector: ClipVector) {
    // Create the object that will be used later by the "addToScene" method.
    this.setClipVector(clipVector);
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

    this.prepareNewBranch(vp);

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

    this.resetOldView(vp);
  }

  protected abstract prepareNewBranch(vp: Viewport): void;
  protected abstract resetOldView(vp: Viewport): void;

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

class ComparisonWireframeProvider extends SampleTiledGraphicsProvider {
  public comparisonType = ComparisonType.Wireframe;

  constructor(clip: ClipVector) {
    super(clip);
    // Create the objects that will be used later by the "addToScene" method.
    this.viewFlagOverrides.setRenderMode(RenderMode.Wireframe);
  }

  protected prepareNewBranch(_vp: Viewport): void { }
  protected resetOldView(_vp: Viewport): void { }
}

class ComparisonRealityModelProvider extends SampleTiledGraphicsProvider {
  public comparisonType = ComparisonType.RealityData;

  protected prepareNewBranch(vp: Viewport): void {
    // Hides the reality model while rendering the other graphics branch.
    SwipingViewportApp.setRealityModelTransparent(vp, true);
  }
  protected resetOldView(vp: Viewport): void {
    // Makes the reality model visible again in the viewport.
    SwipingViewportApp.setRealityModelTransparent(vp, false);
  }
}
