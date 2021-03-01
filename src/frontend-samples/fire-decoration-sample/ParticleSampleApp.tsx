/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d, Range3d, Transform } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { DecorateContext, Decorator, GraphicType, IModelApp } from "@bentley/imodeljs-frontend";
import { I18NNamespace } from "@bentley/imodeljs-i18n";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import { PlaceMarkerTool } from "frontend-samples/marker-pin-sample/PlaceMarkerTool";
import * as React from "react";
import { FireDecorator } from "./Particle";
import FireDecorationUI from "./ParticleSampleUI";
import { PlacementTool } from "./PlacementTool";

/** This decorator functions to highlight a given emitter by outlining the source range. */
class EmitterHighlighter implements Decorator {
  public emitter?: FireDecorator;
  public decorate(context: DecorateContext) {
    if (undefined === this.emitter)
      return;
    const range = Range3d.createXYZXYZ(
      this.emitter.params.effectRange.low.x,
      this.emitter.params.effectRange.low.y,
      0,
      this.emitter.params.effectRange.high.x,
      this.emitter.params.effectRange.high.y,
      0,
    );
    const transform = Transform.createTranslation(this.emitter.source);
    const sceneBuilder = context.createSceneGraphicBuilder();
    sceneBuilder.addRangeBox(transform.multiplyRange(range));
    context.addDecoration(GraphicType.WorldOverlay, sceneBuilder.finish());
  }
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class FireDecorationApp implements SampleApp {
  private static _sampleNamespace: I18NNamespace;
  private static _highlighter = new EmitterHighlighter();

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    this._sampleNamespace = IModelApp.i18n.registerNamespace("fire-i18n-namespace");
    PlacementTool.register(this._sampleNamespace);

    IModelApp.viewManager.addDecorator(this._highlighter);

    return <FireDecorationUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown() {
    IModelApp.viewManager.dropDecorator(this._highlighter);
  }

  public static highlightEmitter(emitter?: FireDecorator) {
    FireDecorationApp._highlighter.emitter = emitter;
  }
}
