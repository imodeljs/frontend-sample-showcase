/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import {
  ScreenSpaceEffectBuilder, ScreenSpaceEffectBuilderParams,
} from "@bentley/imodeljs-frontend";

// The amount of saturation to be applied by the Saturation effect. Edit this value to adjust the effect.
const saturationMultiplier = 2.0;

export interface Effect extends ScreenSpaceEffectBuilderParams {
  // A function invoked once, when the screen-space effect is being initialized, to define any uniform or varying variables used by the shaders.
  defineEffect: (builder: ScreenSpaceEffectBuilder) => void;
}

export const effects: Effect[] = [{
  name: "Saturation",
  // Request that the `textureCoordFromPosition` function be included in the vertex shader.
  textureCoordFromPosition: true,
  // GLSL shader code implementing the effect.
  // rgb <-> hsl conversion routines from https://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness
  source: {
    // Vertex shader simply computes texture coordinate for source pixel.
    vertex: `
      void effectMain(vec4 pos) {
        v_texCoord = textureCoordFromPosition(pos);
      }`,
    // Fragment shader converts color to HSV, adjusts the saturation, and converts back to RGB.
    fragment: `
      vec3 rgb2hsv(vec3 c) {
        vec4 K = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
        vec4 p = mix(vec4(c.bg, K.wz), vec4(c.gb, K.xy), step(c.b, c.g));
        vec4 q = mix(vec4(p.xyw, c.r), vec4(c.r, p.yzx), step(p.x, c.r));

        float d = q.x - min(q.w, q.y);
        float e = 1.0e-10;
        return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + e)), d / (q.x + e), q.x);
      }

      vec3 hsv2rgb(vec3 c) {
        vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
        vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
        return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
      }

      vec4 effectMain() {
        vec4 color = TEXTURE(u_diffuse, v_texCoord);
        color.rgb = rgb2hsv(color.rgb);
        color.rgb.y = color.rgb.y * u_saturationMult;
        color.rgb = hsv2rgb(color.rgb);
        return color;
      }`,
  },
  // Define uniform and varying variables used by the shaders.
  defineEffect: (builder: ScreenSpaceEffectBuilder) => {
    // Texture coordinates computed in vertex shader and used to look up the image color in the fragment shader.
    builder.addVarying("v_texCoord", VaryingType.Vec2);

    // Uniform specifying to fragment shader how much saturation to apply.
    builder.addUniform({
      name: "u_saturationMult",
      type: UniformType.Float,
      bind: (uniform) => uniform.setUniform1f(saturationMultiplier),
    });
  },
}];
