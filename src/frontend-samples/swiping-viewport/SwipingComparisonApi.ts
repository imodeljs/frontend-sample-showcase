/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ClipPlane, ClipPrimitive, ClipVector, ConvexClipPlaneSet, Point3d, Transform, Vector3d } from "@itwin/core-geometry";
import { ContextRealityModelProps, FeatureAppearance, Frustum, RealityDataFormat, RealityDataProvider, RenderMode } from "@itwin/core-common";
import { AccuDrawHintBuilder, FeatureSymbology, GraphicBranch, IModelApp, RenderClipVolume, SceneContext, ScreenViewport, TiledGraphicsProvider, TileTreeReference, Viewport } from "@itwin/core-frontend";
import { RealityDataAccessClient, RealityDataResponse } from "@itwin/reality-data-client";

export enum ComparisonType {
  Wireframe,
  RealityData,
}

// const compareDebugClipStyle = ClipStyle.create(true, CutStyle.defaults, RgbColor.fromColorDef(ColorDef.blue), RgbColor.fromColorDef(ColorDef.green));

export default class SwipingComparisonApi {
  private static _provider: SampleTiledGraphicsProvider | undefined;
  private static _viewport?: Viewport;

  /** Called by the showcase before swapping to another sample. */
  public static teardown(): void {
    if (undefined !== SwipingComparisonApi._viewport && undefined !== SwipingComparisonApi._provider) {
      SwipingComparisonApi.disposeProvider(SwipingComparisonApi._viewport, SwipingComparisonApi._provider);
      SwipingComparisonApi._provider = undefined;
    }
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
  public static getRect(vp: ScreenViewport): DOMRect {
    // Calling DOMRect.fromRect to clone the rect so the state in the App will update properly.
    return DOMRect.fromRect(vp.getClientRect());
  }

  /** Convert a point in the view space to the world space using the viewport API. */
  public static getWorldPoint(vp: Viewport, screenPoint: Point3d): Point3d {
    return vp.viewToWorld(screenPoint);
  }

  /** Return a vector perpendicular to the view considering the camera's perspective. */
  public static getPerpendicularNormal(vp: Viewport, screenPoint: Point3d): Vector3d {
    const point = SwipingComparisonApi.getWorldPoint(vp, screenPoint);

    const boresite = AccuDrawHintBuilder.getBoresite(point, vp);
    const viewY = vp.rotation.rowY();
    const normal = viewY.crossProduct(boresite.direction);
    return normal;
  }

  /** Will create an effect allowing for different views on either side of an arbitrary point in the view space.  This will allows us to compare the effect the views have on the iModel. */
  public static compare(screenPoint: Point3d, viewport: Viewport, comparisonType: ComparisonType) {
    if (viewport.viewportId !== SwipingComparisonApi._viewport?.viewportId)
      SwipingComparisonApi.teardown();
    SwipingComparisonApi._viewport = viewport;
    const provider = SwipingComparisonApi._provider;
    if (!viewport.view.isSpatialView())
      return;

    if (undefined !== provider && provider.comparisonType !== comparisonType) {
      SwipingComparisonApi.disposeProvider(viewport, SwipingComparisonApi._provider!);
      SwipingComparisonApi._provider = undefined;
    }

    if (undefined === SwipingComparisonApi._provider) {
      SwipingComparisonApi._provider = SwipingComparisonApi.createProvider(screenPoint, viewport, comparisonType);
      // viewport.addTiledGraphicsProvider(SwipingComparisonApi._provider);
    }

    SwipingComparisonApi.updateProvider(screenPoint, viewport, SwipingComparisonApi._provider);
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
    const normal = SwipingComparisonApi.getPerpendicularNormal(viewport, screenPoint);
    const worldPoint = SwipingComparisonApi.getWorldPoint(viewport, screenPoint);

    // Update in Provider
    const clip = SwipingComparisonApi.createClip(normal.clone().negate(), worldPoint);
    provider.setClipVector(clip);

    // Update in Viewport
    // viewport.view.setViewClip(SwipingComparisonApi.createClip(normal.clone(), worldPoint));
    // viewport.setAlwaysDrawn(new Set("0x2000000acf7"), true);

    viewport.synchWithView();
  }

  /** Creates a [TiledGraphicsProvider] and adds it to the viewport.  This also sets the clipping plane used for the comparison. */
  private static createProvider(screenPoint: Point3d, viewport: Viewport, type: ComparisonType): SampleTiledGraphicsProvider {
    const normal = SwipingComparisonApi.getPerpendicularNormal(viewport, screenPoint);
    let rtnProvider;

    // Note the normal is negated, this is flip the clipping plane created from it.
    const negatedClip = SwipingComparisonApi.createClip(normal.clone().negate(), SwipingComparisonApi.getWorldPoint(viewport, screenPoint));
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
  }

  /** Get first available reality models and attach it to displayStyle. */
  public static async attachRealityData(viewport: Viewport) {
    const imodel = viewport.iModel;
    const style = viewport.displayStyle.clone();
    const RealityDataClient = new RealityDataAccessClient();
    const available: RealityDataResponse = await RealityDataClient.getRealityDatas(await IModelApp.authorizationClient!.getAccessToken(), imodel.iTwinId, undefined);

    const availableModels: ContextRealityModelProps[] = [];

    for (const rdEntry of available.realityDatas) {
      const name = undefined !== rdEntry.displayName ? rdEntry.displayName : rdEntry.id;
      const rdSourceKey = {
        provider: RealityDataProvider.ContextShare,
        format: rdEntry.type === "OPC" ? RealityDataFormat.OPC : RealityDataFormat.ThreeDTile,
        id: rdEntry.id,
      };
      const tilesetUrl = await IModelApp.realityDataAccess?.getRealityDataUrl(imodel.iTwinId, rdSourceKey.id);
      if (tilesetUrl) {
        const entry: ContextRealityModelProps = {
          rdSourceKey,
          tilesetUrl,
          name,
          description: rdEntry?.description,
          realityDataId: rdSourceKey.id,
        };

        availableModels.push(entry);
        break;
      }
    }

    for (const crmProp of availableModels) {
      style.attachRealityModel(crmProp);
      viewport.displayStyle = style;
    }
  }

  /** Set the transparency of the reality models using the Feature Override API. */
  public static setRealityModelTransparent(vp: Viewport, transparent: boolean): void {
    const override = { transparency: (transparent ?? false) ? 1.0 : 0.0 };
    vp.displayStyle.settings.contextRealityModels.models.forEach((model) => {
      model.appearanceOverrides = model.appearanceOverrides ? model.appearanceOverrides.clone(override) : FeatureAppearance.fromJSON(override);
    });
  }
}

abstract class SampleTiledGraphicsProvider implements TiledGraphicsProvider {
  public readonly abstract comparisonType: ComparisonType;
  public viewFlagOverrides = { renderMode: RenderMode.Wireframe, showClipVolume: false };
  public clipVolume: RenderClipVolume | undefined;
  constructor(clipVector: ClipVector) {
    // Create the object that will be used later by the "addToScene" method.
    this.setClipVector(clipVector);
  }

  /** Apply the supplied function to each [[TileTreeReference]] to be drawn in the specified [[Viewport]]. */
  public forEachTileTreeRef(viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    viewport.view.forEachTileTreeRef(func);

    // Do not apply the view's clip to this provider's graphics - it applies its own (opposite) clip to its graphics.
    this.viewFlagOverrides.showClipVolume = false;
  }

  /** Overrides the logic for adding this provider's graphics into the scene. */
  public addToScene(output: SceneContext): void {

    // Save view to be replaced after comparison is drawn
    const vp = output.viewport;
    // const clip = vp.view.getViewClip();

    // Replace the clipping plane with a flipped one.
    // vp.view.setViewClip(this.clipVolume?.clipVector);

    // vp.clipStyle = compareDebugClipStyle;

    this.prepareNewBranch(vp);

    vp.clearAlwaysDrawn();

    const context: SceneContext = new SceneContext(vp);
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
      output.outputGraphic(IModelApp.renderSystem.createGraphicBranch(branch, Transform.createIdentity(), { /* clipVolume: this.clipVolume */ }));
    }

    // Return the old clip to the view.
    // vp.view.setViewClip(clip);

    vp.setAlwaysDrawn(new Set("0x2000000acf7"), true);
    // vp.clipStyle = ClipStyle.defaults;

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
}

class ComparisonWireframeProvider extends SampleTiledGraphicsProvider {
  public comparisonType = ComparisonType.Wireframe;

  constructor(clip: ClipVector) {
    super(clip);
    // Create the objects that will be used later by the "addToScene" method.
    this.viewFlagOverrides.renderMode = RenderMode.Wireframe;
  }

  protected prepareNewBranch(_vp: Viewport): void { }
  protected resetOldView(_vp: Viewport): void { }
}

class ComparisonRealityModelProvider extends SampleTiledGraphicsProvider {
  public comparisonType = ComparisonType.RealityData;

  protected prepareNewBranch(vp: Viewport): void {
    // Hides the reality model while rendering the other graphics branch.
    SwipingComparisonApi.setRealityModelTransparent(vp, true);
  }
  protected resetOldView(vp: Viewport): void {
    // Makes the reality model visible again in the viewport.
    SwipingComparisonApi.setRealityModelTransparent(vp, false);
  }
}
