/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { assert } from "@itwin/core-bentley";
import { IModelApp } from "@itwin/core-frontend";
import "common/samples-common.scss";
import { effects } from "./Effects";

export default class ScreenSpaceEffectsApi {
  public static _effectsRegistered = false;

  public static registerEffects(): void {
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
