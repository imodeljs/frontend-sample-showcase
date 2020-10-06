/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import {
  ClipPlane,
  ClipPrimitive,
  ClipVector,
  ConvexClipPlaneSet,
  Point3d,
  Transform,
  Vector3d,
} from "@bentley/geometry-core";
import {
  ContextRealityModelProps,
  FeatureAppearance,
  Frustum,
  RenderMode,
  ViewFlagOverrides,
} from "@bentley/imodeljs-common";
import {
  ContextRealityModelState,
  EditManipulator,
  FeatureSymbology,
  findAvailableUnattachedRealityModels,
  GraphicBranch,
  IModelApp,
  IModelConnection,
  RenderClipVolume,
  SceneContext,
  ScreenViewport,
  TiledGraphicsProvider,
  TileTreeReference,
  Viewport,
  FeatureOverrideProvider,
} from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import * as React from "react";
import SwipingComparisonUI from "./SwipingComparisonUI";

export enum ComparisonType {
  Wireframe,
  RealityData,
}

export default class SwipingViewportApp implements SampleApp {
  private static _provider: SampleTiledGraphicsProvider | undefined;
  private static _prevPoint?: Point3d;
  private static _viewport?: Viewport;
  private static _realityModelProps: ContextRealityModelProps[] = [];

  public static toggleProvider(isOn: boolean): void {
    const vp = SwipingViewportApp._viewport;
    const p = SwipingViewportApp._provider;
    if (!vp || !p)
      return;
    if (isOn) {

      vp.addTiledGraphicsProvider(p);
    } else {

      vp.dropTiledGraphicsProvider(p);
    }
  }

  /** Called by the showcase before the sample is started. */
  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {
    return <SwipingComparisonUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** Called by the showcase before swapping to another sample. */
  public static teardown(): void {
    SwipingViewportApp._realityModelProps = [];
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

    if (provider?.comparisonType !== comparisonType && undefined !== provider) {
      SwipingViewportApp.disposeProvider(SwipingViewportApp._viewport, SwipingViewportApp._provider!);
      SwipingViewportApp._provider = undefined;
    }

    if (undefined === provider) {
      SwipingViewportApp.initProvider(screenPoint, viewport, comparisonType);
      vp.synchWithView();
    } else if (!SwipingViewportApp._prevPoint?.isAlmostEqual(screenPoint)) {
      SwipingViewportApp.updateProvider(screenPoint, viewport, provider);
    }
    vp.invalidateScene();
  }

  public static async attachRealityData(imodel: IModelConnection) {
    const promise = findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
    promise.then((props: ContextRealityModelProps[]) => {
      if (undefined !== SwipingViewportApp._provider && SwipingViewportApp._provider.comparisonType === ComparisonType.RealityData) {
        (SwipingViewportApp._provider as ComparisonRealityDataProvider).props = props;
      }
      SwipingViewportApp._realityModelProps = props;
    }).catch();
    return promise;
  }

  public static async toggleRealityModel(showReality: boolean, viewPort: ScreenViewport, imodel: IModelConnection) {
    const style = viewPort.displayStyle.clone();

    if (showReality) {
      // Get all available reality models and attach them to displayStyle
      const availableModels: ContextRealityModelProps[] = await findAvailableUnattachedRealityModels(imodel.contextId!, imodel);
      for (const crmProp of availableModels) {
        style.attachRealityModel(crmProp);
        viewPort.displayStyle = style;
      }
    } else {
      // Collect reality models on displayStyle and detach
      const models: ContextRealityModelState[] = [];
      style.forEachRealityModel(
        (modelState: ContextRealityModelState) => { models.push(modelState); },
      );
      for (const model of models)
        style.detachRealityModelByNameAndUrl(model.name, model.url);
      viewPort.displayStyle = style;
    }
  }

  public static setTransparency(vp: Viewport, transparency: boolean | undefined): void {
    EmphasizeRealityData.isVisible = transparency ?? false;
    vp.setFeatureOverrideProviderChanged();
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
    const clip = SwipingViewportApp.createClip(normal.clone().negate(), worldPoint);

    provider.clipVolume?.dispose();
    provider.setClipVector(clip);

    viewport.view.setViewClip(SwipingViewportApp.createClip(normal.clone(), worldPoint));
    viewport.synchWithView();
  }

  /** Creates a [TiledGraphicsProvider] and adds it to the viewport.  This also sets the clipping plane used for the comparison. */
  private static initProvider(screenPoint: Point3d, viewport: Viewport, type: ComparisonType) {
    SwipingViewportApp._prevPoint = screenPoint;
    const vp = viewport;
    const normal = SwipingViewportApp.getPerpendicularNormal(viewport, screenPoint);

    // Note the normal is negated, this is flip the clipping plane created from it.
    const negatedClip = SwipingViewportApp.createClip(normal.clone().negate(), SwipingViewportApp.getWorldPoint(viewport, screenPoint));
    switch (type) {
      case ComparisonType.Wireframe:
      default:
        SwipingViewportApp._provider = new ComparisonWireframeProvider(negatedClip);
        break;
      case ComparisonType.RealityData:
        SwipingViewportApp._provider = new ComparisonRealityDataProvider(negatedClip, SwipingViewportApp._realityModelProps);
        break;
    }
    vp.addTiledGraphicsProvider(SwipingViewportApp._provider);

    // Note the normal is NOT negated.  These opposite facing clipping planes will create a effect we can use to compare views.
    const clip = SwipingViewportApp.createClip(normal.clone(), SwipingViewportApp.getWorldPoint(viewport, screenPoint));
    vp.view.setViewClip(clip);
    vp.viewFlags.clipVolume = true;
  }

  /** Removes the provider from the viewport, and disposed of any resources it has. */
  private static disposeProvider(viewport: Viewport, provider: SampleTiledGraphicsProvider) {
    viewport.dropTiledGraphicsProvider(provider);
    // Not all [TiledGraphicsProvider] are disposable the ones used in this sample are.
    provider.dispose();
  }
}

abstract class SampleTiledGraphicsProvider implements TiledGraphicsProvider {
  public readonly abstract comparisonType: ComparisonType;
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
  public abstract addToScene(output: SceneContext): void;
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

class EmphasizeRealityData implements FeatureOverrideProvider {
  public static isVisible: boolean = false;

  /** Establish active feature overrides to emphasize elements and apply color/transparency overrides.
   * @see [[Viewport.featureOverrideProvider]]
   */
  public addFeatureOverrides(overrides: FeatureSymbology.Overrides, vp: Viewport): void {
    // super.addFeatureOverrides(overrides,vp);
    const style = vp.displayStyle.clone();
    const prop = {transparency: (EmphasizeRealityData.isVisible ? 0.0 : 1.0)};
    style.forEachRealityModel(
      (modelState: ContextRealityModelState) => {
        if (undefined !== modelState.modelId)
          overrides.overrideModel(modelState.modelId, FeatureAppearance.fromJSON(prop));
      },
    );
    // RealityDataManager.get().realityDataEntries.forEach((entry) => {
    //   if (entry.fsa) {
    //     const modelId = RealityDataManager.get().getModelId(vp, entry);
    //     if (modelId) {
    //       overrides.overrideModel(modelId, FeatureAppearance.fromJSON(prop));
    //     }
    //   }
    // });
  }

  public emphasizeRealityData(vp: Viewport): boolean {
    EmphasizeRealityData.isVisible = true;
    vp.setFeatureOverrideProviderChanged();
    return true;
  }

  public static addProvider(vp: Viewport) {
    vp.addFeatureOverrideProvider(new EmphasizeRealityData());
  }
  public static dropProvider(vp: Viewport) {
    vp.dropFeatureOverrideProvider(new EmphasizeRealityData());
  }
}

class ComparisonWireframeProvider extends SampleTiledGraphicsProvider {
  public viewFlagOverrides = new ViewFlagOverrides();
  public comparisonType = ComparisonType.Wireframe;

  constructor(clip: ClipVector) {
    super(clip);
    // Create the objects that will be used later by the "addToScene" method.
    this.viewFlagOverrides.setRenderMode(RenderMode.Wireframe);
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

class ComparisonRealityDataProvider extends SampleTiledGraphicsProvider {
  public comparisonType = ComparisonType.RealityData;
  public props: ContextRealityModelProps[];

  constructor(clip: ClipVector, props: ContextRealityModelProps[]) {
    super(clip);
    this.props = props;
  }

  public addToScene(output: SceneContext): void {
    const vp = output.viewport;
    const clip = vp.view.getViewClip();
    vp.view.setViewClip(this.clipVolume?.clipVector);

    // if (ChannelType.RealityData === this.rightChannel.channelType && this.rightChannel.realityDataEntries) {
    //   this.rightChannel.realityDataEntries.forEach(rde => RealityDataManager.get().setTransparency(vp, rde, 1.0)); //1.0 invisible
    // }

    // if (ChannelType.RealityData === this.leftChannel.channelType && this.leftChannel.realityDataEntries) {
    //   this.leftChannel.realityDataEntries.forEach(rde => RealityDataManager.get().setTransparency(vp, rde, 0.0)); //0.0 visible
    // }

    // vp.changeModelDisplay([...vp.iModel.models.loaded.keys()], ChannelType.Schedule === this.leftChannel.channelType);

    EmphasizeRealityData.isVisible = false;

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
    // SwipingViewportApp.(vp, this.props);
    EmphasizeRealityData.isVisible = true;
    // if (ChannelType.RealityData === this.rightChannel.channelType && this.rightChannel.realityDataEntries) {
    //   this.rightChannel.realityDataEntries.forEach(rde => RealityDataManager.get().setTransparency(vp, rde, 0.0));
    // }
    // if (ChannelType.RealityData === this.leftChannel.channelType && this.leftChannel.realityDataEntries) {
    //   this.leftChannel.realityDataEntries.forEach(rde => RealityDataManager.get().setTransparency(vp, rde, 1.0));
    // }

    // vp.changeModelDisplay([...vp.iModel.models.loaded.keys()], ChannelType.Schedule === this.rightChannel.channelType);
  }
}
