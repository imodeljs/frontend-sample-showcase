/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import {
  ScreenSpaceEffectBuilder, ScreenSpaceEffectBuilderParams, UniformType, VaryingType,
} from "@bentley/imodeljs-frontend";

/** Settings that control how the saturation effect is applied. */
export interface SaturationConfig {
  /** The amount of saturation to be applied by the Saturation effect. A value of 1.0 produces no change. A value less than 1.0 desaturates the image. */
  multiplier: number;
}

/** Settings that control how the vignette effect is applied. */
export interface VignetteConfig {
  /** Size of the vignette in [0, 1]. e.g., to make the vignette start fading in halfway between the center and edges of UV space, use 0.5.  */
  size: number;

  /** How round the vignette will be, from 0.0 (perfectly rectangular) to 1.0 (perfectly round). */
  roundness: number;

  /** How quickly the vignette fades in, in [0, 1]. The vignette starts fading in at the edge of the values provided by `size` and will be
   * fully faded in at size * smoothness. A value of 0.0 produces a hard edge.
   */
  smoothness: number;
}

/** Settings that control how the lens distortion effect is applied. */
export interface LensDistortionConfig {
  /** The magnitude of the distortion from 0 (fully perspective) to 1 (fully stereographic). */
  strength: number;
  /** The cylindricality of the distortion in [0, 1] where 1 is spherical. */
  cylindricalRatio: number;
}

/** Settings that control how the effects are applied. */
export interface EffectsConfig {
  readonly saturation: SaturationConfig;
  readonly vignette: VignetteConfig;
  readonly lensDistortion: LensDistortionConfig;
}

/** Stores the current settings. These  are updated by sliders in the UI. */
let effectsConfig: EffectsConfig = {
  saturation: {
    multiplier: 2.5,
  },
  vignette: {
    size: 0.5,
    roundness: 1.0,
    smoothness: 0.5,
  },
  lensDistortion: {
    strength: 0.5,
    cylindricalRatio: 0.5,
  },
};

/** Create a deep copy of an EffectsConfig. */
export function cloneEffectsConfig(config: EffectsConfig): EffectsConfig {
  return {
    saturation: { ...config.saturation },
    vignette: { ...config.vignette },
    lensDistortion: { ...config.lensDistortion },
  };
}

/** Obtain a copy of the current EffectsConfig. */
export function getCurrentEffectsConfig(): EffectsConfig {
  return cloneEffectsConfig(effectsConfig);
}

/** Update the current EffectsConfig. */
export function updateEffectsConfig(newConfig: EffectsConfig): void {
  effectsConfig = cloneEffectsConfig(newConfig);
}

/** Return true if both EffectsConfigs have the same values for all settings. */
export function equalEffectsConfigs(a: EffectsConfig, b: EffectsConfig): boolean {
  return a.saturation.multiplier === b.saturation.multiplier &&
    a.vignette.size === b.vignette.size && a.vignette.roundness === b.vignette.roundness && a.vignette.smoothness === b.vignette.smoothness &&
    a.lensDistortion.strength === b.lensDistortion.strength && a.lensDistortion.cylindricalRatio === b.lensDistortion.cylindricalRatio;
}

/** Describes a screen-space effect. */
export interface Effect extends ScreenSpaceEffectBuilderParams {
  /** A function invoked once, when the screen-space effect is being initialized, to define any uniform or varying variables used by the shaders. */
  defineEffect: (builder: ScreenSpaceEffectBuilder) => void;
}

/** The list of available effects. */
export const effects: Effect[] = [{
  // Each pixel is converted from RGB to HSV (hue-saturation-value). A multiplier is applied to the saturation, then the color is converted back to RGB.
  name: "Saturation",
  // Request that the `textureCoordFromPosition` function be included in the vertex shader.
  textureCoordFromPosition: true,
  // GLSL shader code implementing the effect.
  source: {
    // Vertex shader simply computes texture coordinate for source pixel.
    vertex: `
      void effectMain(vec4 pos) {
        v_texCoord = textureCoordFromPosition(pos);
      }`,
    // Fragment shader converts color to HSV, adjusts the saturation, and converts back to RGB.
    // rgb <-> hsl conversion routines from https://gamedev.stackexchange.com/questions/59797/glsl-shader-change-hue-saturation-brightness
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
      bind: (uniform) => uniform.setUniform1f(effectsConfig.saturation.multiplier),
    });
  },
}, {
  /** Applies [vignetting](https://en.wikipedia.org/wiki/Vignetting) to the image, fading areas on the periphery to emphasize the center of the image. */
  name: "Vignette",
  textureCoordFromPosition: true,
  source: {
    // Vertex shader simply computes texture coordinate for source pixel.
    vertex: `
      void effectMain(vec4 pos) {
        v_texCoord = textureCoordFromPosition(pos);
      }
    `,
    // Fragment shader darkens image at edges.
    fragment: `
      float sdSquare(vec2 point, float width) {
        vec2 d = abs(point) - width;
        return min(max(d.x,d.y),0.0) + length(max(d,0.0));
      }

      float vignette(vec2 uv, vec2 size, float roundness, float smoothness) {
        // Center UVs
        uv -= 0.5;

        // Shift UVs based on the larger of width or height
        float minWidth = min(size.x, size.y);
        uv.x = sign(uv.x) * clamp(abs(uv.x) - abs(minWidth - size.x), 0.0, 1.0);
        uv.y = sign(uv.y) * clamp(abs(uv.y) - abs(minWidth - size.y), 0.0, 1.0);

        // Signed distance calculation
        float boxSize = minWidth * (1.0 - roundness);
        float dist = sdSquare(uv, boxSize) - (minWidth * roundness);

        return 1.0 - smoothstep(0.0, smoothness, dist);
      }

      vec4 effectMain() {
        return TEXTURE(u_diffuse, v_texCoord) * vignette(v_texCoord, u_size, u_roundness, u_smoothness);
      }
    `,
  },
  defineEffect: (builder: ScreenSpaceEffectBuilder) => {
    builder.addVarying("v_texCoord", VaryingType.Vec2);
    builder.addUniform({
      name: "u_size",
      type: UniformType.Vec2,
      bind: (uniform) => uniform.setUniform2fv([effectsConfig.vignette.size / 2, effectsConfig.vignette.size / 2]),
    });
    builder.addUniform({
      name: "u_roundness",
      type: UniformType.Float,
      bind: (uniform) => uniform.setUniform1f(effectsConfig.vignette.roundness),
    });
    builder.addUniform({
      name: "u_smoothness",
      type: UniformType.Float,
      bind: (uniform) => uniform.setUniform1f(effectsConfig.vignette.smoothness),
    });
  },
}, {
  // Simulates the lens distortion produced by real-world cameras with very wide fields of view, bending the image at its periphery.
  // Based on https://www.decarpentier.nl/lens-distortion
  name: "Lens Distortion",
  textureCoordFromPosition: true,
  source: {
    // The vertex shader computes the texture coordinate for the fragment shader to sample.
    vertex: `
      void effectMain(vec4 position) {
        vec2 uv = textureCoordFromPosition(position);
        float scaledHeight = strength * height;
        float cylAspectRatio = aspectRatio * cylindricalRatio;
        float aspectDiagSq = aspectRatio * aspectRatio + 1.0;
        float diagSq = scaledHeight * scaledHeight * aspectDiagSq;
        vec2 signedUV = (2.0 * uv + vec2(-1.0, -1.0));

        float z = 0.5 * sqrt(diagSq + 1.0) + 0.5;
        float ny = (z - 1.0) / (cylAspectRatio * cylAspectRatio + 1.0);

        vUVDot = sqrt(ny) * vec2(cylAspectRatio, 1.0) * signedUV;
        vUV = vec3(0.5, 0.5, 1.0) * z + vec3(-0.5, -0.5, 0.0);
        vUV.xy += uv;
      }`,
    // The fragment shader simply shifts pixels - it does not alter their colors.
    fragment: `
      vec4 effectMain() {
        return sampleSourcePixel();
      }`,
    // Because we're moving pixels around, we must tell the render system where the source pixel was originally located - otherwise
    // element locate will not work correctly.
    sampleSourcePixel: `
      vec3 uv = dot(vUVDot, vUVDot) * vec3(-0.5, -0.5, -1.0) + vUV;
      return TEXTURE_PROJ(u_diffuse, uv);
    `,
  },
  defineEffect: (builder: ScreenSpaceEffectBuilder) => {
    // Lens distortion is only applicable to views with the camera enabled.
    builder.shouldApply = (context) => context.viewport.isCameraOn;

    builder.addVarying("vUV", VaryingType.Vec3);
    builder.addVarying("vUVDot", VaryingType.Vec2);

    builder.addUniform({
      name: "strength",
      type: UniformType.Float,
      bind: (uniform) => uniform.setUniform1f(effectsConfig.lensDistortion.strength),
    });
    builder.addUniform({
      name: "cylindricalRatio",
      type: UniformType.Float,
      bind: (uniform) => uniform.setUniform1f(effectsConfig.lensDistortion.cylindricalRatio),
    });
    builder.addUniform({
      name: "aspectRatio",
      type: UniformType.Float,
      bind: (uniform, context) => uniform.setUniform1f(context.viewport.viewRect.aspect),
    });
    builder.addUniform({
      name: "height",
      type: UniformType.Float,
      bind: (uniform, context) => {
        let height = 0;
        if (context.viewport.view.isCameraEnabled()) {
          const fov = context.viewport.view.camera.lens.radians;
          height = Math.tan(fov / 2) / context.viewport.viewRect.aspect;
        }

        uniform.setUniform1f(height);
      },
    });
  },
}];
