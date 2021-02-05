/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { FeatureAppearance, IModelTileRpcInterface, TileVersionInfo } from "@bentley/imodeljs-common";
import { Animator, EmphasizeElements, FeatureOverrideProvider, FeatureSymbology, IModelApp, ScreenViewport, TiledGraphicsProvider, TileTreeReference, Viewport } from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import * as React from "react";
import { ExplodeTreeReference } from "./ExplodeTile";
import ExplodeUI from "./ExplodeUI";

export interface ExplodeFactorsAttributes {
  min: number;
  max: number;
  step: number;
}
export default class ExplodeApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <ExplodeUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /** The attributes describing the range of the explode factor. */
  public static explodeAttributes: ExplodeFactorsAttributes = {
    min: 0,
    max: 2,
    step: 0.05,
  };
  /** Uses the IModelTileRpcInterface API to query for the tile version info */
  public static async queryTileFormatVersionInfo(): Promise<TileVersionInfo> {
    return IModelTileRpcInterface.getClient().queryVersionInfo();
  }
  /** Returns a explosion provider associated with the given viewport.  If one does not exist, it will be created. */
  public static getOrCreateProvider(vp: Viewport) {
    return ExplodeProvider.getOrCreate(vp);
  }
  /** Uses the  EmphasizeElements API to isolate the elements related to the ids given. */
  public static emphasizeElements(vp: Viewport, elementIds: string[]) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.emphasizeElements(elementIds, vp, undefined, true);
  }
  /** Uses the  EmphasizeElements API to isolate the elements related to the ids given. */
  public static isolateElements(vp: Viewport, elementIds: string[]) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.isolateElements(elementIds, vp, true);
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

  /** Updates the tile tree reference with the given data. */
  public static refSetData(vp: Viewport, name: string, ids: string[], explodeFactor: number) {
    const provider = ExplodeApp.getOrCreateProvider(vp);
    provider.setData(name, ids, explodeFactor);
    provider.invalidate();
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
  public setData(name: string, elementIds: string[], explodeFactor: number) {
    this.explodeTileTreeRef.explodeFactor = explodeFactor;
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
  /** Signals the viewport to redraw graphics. */
  public invalidate() {
    this.vp.setFeatureOverrideProviderChanged();
  }
  public constructor(public vp: Viewport) { }
  public explodeTileTreeRef = new ExplodeTreeReference(this.vp.iModel);

  public addFeatureOverrides(overrides: FeatureSymbology.Overrides, _vp: Viewport): void {
    const app = FeatureAppearance.fromTransparency(1);
    this.explodeTileTreeRef.id.ids.forEach((id) => {
      // TODO: hide elements when Emphasized (not isolated)
      overrides.overrideElement(id, app, true);
    });
  }

  /** Apply the supplied function to each [[TileTreeReference]] to be drawn in the specified [[Viewport]]. */
  public forEachTileTreeRef(_viewport: ScreenViewport, func: (ref: TileTreeReference) => void): void {
    func(this.explodeTileTreeRef);
  }
}
