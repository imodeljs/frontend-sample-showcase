/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { assert } from "@bentley/bentleyjs-core";
import { IModelApp } from "@bentley/imodeljs-frontend";
import SampleApp from "common/SampleApp";
import "common/samples-common.scss";
import * as React from "react";
import ScreenSpaceEffectsUI from "./ScreenSpaceEffectsUI";
import { effects } from "./Effects";

export default class ScreenSpaceEffectsApp implements SampleApp {
  private static _effectsRegistered = false;

  public static async setup(iModelName: string, iModelSelector: React.ReactNode): Promise<React.ReactNode> {
    // We need to register the effects once, after IModelApp.startup is invoked.
    if (!this._effectsRegistered) {
      this.registerEffects();
      this._effectsRegistered = true;
    }

    return <ScreenSpaceEffectsUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  private static registerEffects(): void {
    for (const effect of effects) {
      if ("None" === effect.name)
        continue;

      // Create an effect builder.
      const builder = IModelApp.renderSystem.createScreenSpaceEffectBuilder(effect);
      assert(undefined !== builder, "The default render system supports screen-space effects");

      // Add any uniform or varying variables.
      effect.defineEffect(builder);

      // Compile the shaders and register the effect.
      builder.finish();
    }
  }
}
