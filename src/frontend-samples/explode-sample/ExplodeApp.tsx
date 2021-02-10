/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelTileRpcInterface, TileVersionInfo } from "@bentley/imodeljs-common";
import { Animator, EmphasizeElements, FeatureOverrideProvider, FeatureSymbology, IModelApp, ScreenViewport, TiledGraphicsProvider, TileTreeReference, Viewport } from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import * as React from "react";
import { ExplodeTreeReference } from "./ExplodeTile";
import ExplodeUI from "./ExplodeUI";

export interface ExplodeScalingAttributes {
  min: number;
  max: number;
  step: number;
}
export default class ExplodeApp implements SampleApp {
  /** This method is called by the showcase when loading the sample. */
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ExplodeUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** The attributes describing the range of the explode scaling. */
  public static explodeAttributes: ExplodeScalingAttributes = {
    min: 1,
    max: 3,
    step: 0.05,
  };
  /** Uses the IModelTileRpcInterface API to query for the tile version info */
  public static async queryTileFormatVersionInfo(): Promise<TileVersionInfo> {
    return IModelTileRpcInterface.getClient().queryVersionInfo();
  }
  /** Uses the  EmphasizeElements API to isolate the elements related to the ids given. */
  public static emphasizeElements(vp: Viewport, elementIds: string[]) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.emphasizeElements(elementIds, vp);
  }
  /** Uses the  EmphasizeElements API to isolate the elements related to the ids given. */
  public static isolateElements(vp: Viewport, elementIds: string[]) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.isolateElements(elementIds, vp);
  }
  /** Uses the  EmphasizeElements API to clear all isolated and emphasized. */
  public static clearIsolateAndEmphasized(vp: Viewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearIsolatedElements(vp);
    emph.clearEmphasizedElements(vp);
  }

  /** Uses the IModel.js tools to fit the view to the object on screen. */
  public static fitView(vp: Viewport) {
    IModelApp.tools.run("View.Fit", vp, true);
  }

  /** Updates the tile tree reference with the given data and signals the viewport that changes have been made. */
  public static refSetData(vp: Viewport, name: string, ids: string[], explodeScaling: number) {
    const provider = ExplodeProvider.getOrCreate(vp);
    provider.setData(name, ids, explodeScaling);

    // Necessary when the data changes.
    provider.invalidate();
    // Necessary when the explode scaling changes.
    ExplodeApp.invalidateScene(vp);
  }

  /** Uses the Viewport API to signal that the scene needs to re-render. */
  public static invalidateScene(vp: Viewport) {
    vp.invalidateScene();
  }

  /** Enables an animator using the Viewport API. If the animator is undefined, any active animator will be removed. */
  public static setAnimator(vp: Viewport, animator?: Animator) {
    vp.setAnimator(animator);
  }
}

/** This provider both hides the original graphics of the element and inserts the transformed graphics. */
class ExplodeProvider implements TiledGraphicsProvider, FeatureOverrideProvider {
  /** Returns a provider associated with a given viewport. If one does not exist, it will be created. */
  public static getOrCreate(vp: Viewport) {
    let provider = vp.findFeatureOverrideProviderOfType(ExplodeProvider);
    if (!provider)
      provider = ExplodeProvider.createAndAdd(vp);
    return provider;
  }
  /** Creates a provider associated with a given viewport. */
  public static createAndAdd(vp: Viewport) {
    const provider = new ExplodeProvider(vp);
    provider.add(vp);
    return provider;
  }

  /** Updates the TileTree with the elements and explode scaling. */
  public setData(name: string, elementIds: string[], explodeScaling: number) {
    this.explodeTileTreeRef.explodeFactor = explodeScaling;
    this.explodeTileTreeRef.setExplodeObject(name, elementIds);
  }
  /** Adds provider from viewport */
  public add(vp: Viewport) {
    if (!vp.hasTiledGraphicsProvider(this)) {
      vp.addTiledGraphicsProvider(this);
      vp.addFeatureOverrideProvider(this);
    }
  }
  /** Drops provider from viewport */
  public drop() {
    this.vp.dropFeatureOverrideProvider(this);
    this.vp.dropTiledGraphicsProvider(this);
  }

  /** Signals to the viewport that this provider needs to be recalculated. */
  public invalidate() {
    this.vp.setFeatureOverrideProviderChanged();
  }

  public constructor(public vp: Viewport) { }
  public explodeTileTreeRef = new ExplodeTreeReference(this.vp.iModel);

  /** Insures the static elements are not drawn. */
  public addFeatureOverrides(overrides: FeatureSymbology.Overrides, _vp: Viewport): void {
    const ids = new Set<string>(this.explodeTileTreeRef.id.ids);
    overrides.setNeverDrawnSet(ids);
  }

  /** Apply the supplied function to each [[TileTreeReference]] to be drawn in the specified [[Viewport]]. */
  public forEachTileTreeRef(_viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    func(this.explodeTileTreeRef);
  }
}
