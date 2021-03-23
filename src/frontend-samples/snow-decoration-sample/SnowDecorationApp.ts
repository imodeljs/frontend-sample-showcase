/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point2d, Range1d, Range2d } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { DisplayStyle3dSettingsProps, RenderTexture, SkyBoxProps } from "@bentley/imodeljs-common";
import { imageElementFromUrl, IModelApp, Viewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { SnowDecorator, SnowParams } from "./SnowDecorator";

// WILL BE REMOVED BEFORE PR IS OPEN
const optionRainParticle: 1 | 2 = 1;
const optionSnowSkyBox: 1 | 2 = 2;

/** Props that describe a particular effect using the snow decorator. */
export interface SnowProps {
  textureUrl: string;
  skyStyle: SkyBoxProps;
  params: SnowParams;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
export default class SnowDecorationApp {
  /** Will be updated to dispose the currently active snow decorator. */
  private static _dispose?: VoidFunction;

  /** Allocates memory and creates a RenderTexture from a given URL. */
  public static async allocateTextureFromUrl(url: string): Promise<RenderTexture | undefined> {
    // Note: the caller takes ownership of the textures, and disposes of those resources when they are no longer needed.
    const isOwned = true;
    const params = new RenderTexture.Params(undefined, undefined, isOwned);
    const textureImage = await imageElementFromUrl(url);
    return IModelApp.renderSystem.createTextureFromImage(textureImage, true, undefined, params);
  }

  /** Returns a list of SnowDecorators decorators that have been added using the ViewManager API. */
  public static getSnowDecorators(): SnowDecorator[] {
    return IModelApp.viewManager.decorators.filter((decorator) => decorator instanceof SnowDecorator) as SnowDecorator[];
  }

  /** Calculates the dimensions of the given viewport. */
  public static calculateDimensions(viewport: Viewport) {
    return new Point2d(viewport.viewRect.width, viewport.viewRect.height);
  }

  /** Removes listeners up and frees any resources owned by this sample. */
  public static dispose() {
    if (SnowDecorationApp._dispose)
      SnowDecorationApp._dispose();
  }

  /** Overrides the current display styles using the viewport API. */
  public static overrideSkyBoxStyle(viewport: Viewport, skyStyle: SkyBoxProps) {
    viewport.overrideDisplayStyle({ environment: { sky: { display: true, ...skyStyle }, ground: { display: false } } } as DisplayStyle3dSettingsProps);
  }

  /** Handles creation of a snow decorator, and disposes of old ones. */
  public static async createSnowDecorator(viewport: Viewport, props: SnowProps) {
    // Dispose of any pre-existing decorator.
    SnowDecorationApp.dispose();

    // Create a new decorator.
    const dimensions = SnowDecorationApp.calculateDimensions(viewport);
    const texture = await SnowDecorationApp.allocateTextureFromUrl(props.textureUrl);
    // The decorator takes ownership of the texture.
    const snow = new SnowDecorator(dimensions, props.params, texture);

    // Tell the viewport to re-render the decorations every frame so that the snow particles animate smoothly.
    const removeOnRender = viewport.onRender.addListener(() => viewport.invalidateDecorations());

    // When the viewport is resized, replace this decorator with a new one to match the new dimensions.
    const removeOnResized = viewport.onResized.addListener(() => {
      // Calculate the viewport's new dimensions.
      snow.dimensions = SnowDecorationApp.calculateDimensions(viewport);
      // Re-emit all particles to fit the new space.
      snow.resetParticles();
    });

    // Due to the constructions of the showcase, we know when the viewport will be closed.  Under different circumstances, the methods below are example events to ensure the timely dispose of textures owned by the decorator.
    // When the viewport is destroyed, dispose of this decorator too.
    const removeOnDispose = viewport.onDisposed.addListener(() => SnowDecorationApp.dispose());
    // When the iModel is closed, dispose of any decorations.
    const removeOnClose = viewport.iModel.onClose.addOnce(() => SnowDecorationApp.dispose());

    // Add the decorator to be rendered in all active views.
    const removeDecorator = IModelApp.viewManager.addDecorator(snow);
    // The function "removeDecorator" is equivalent to calling "IModelApp.viewManager.dropDecorator(snow)"

    // Overrides the sky box to better match the effect.
    SnowDecorationApp.overrideSkyBoxStyle(viewport, props.skyStyle);

    SnowDecorationApp._dispose = () => {
      // Removes all event listeners related to the decorator.
      removeDecorator();
      removeOnRender();
      removeOnDispose();
      removeOnClose();
      removeOnResized();
      // Disposes of resources owned by the decorator (e.g. textures)
      snow.dispose();
      SnowDecorationApp._dispose = undefined;
    };
  }

  /** Predefined props that will act as a base when creating a Snow Decorator. */
  public static predefinedProps = new Map<string, SnowProps>(
    [
      [
        "Snow",
        {
          params: {
            particleDensity: 0.0010,
            sizeRange: Range1d.createXX(3, 22),
            transparencyRange: Range1d.createXX(0, 50),
            velocityRange: new Range2d(-30, 50, 30, 130),
            accelerationRange: new Range2d(-1, -0.25, 1, 0.25),
            windVelocity: 0,
          },
          textureUrl: "./particle_snow.png",
          skyStyle: {
            ...(optionSnowSkyBox === 1 ? {
              groundColor: 0x00697D62,
              nadirColor: 0x0053604F,
            } : {
              groundColor: 0x00ACACAC,
              nadirColor: 0x00E3E3E3,
            }),
            skyColor: 0x00C6BC89,
            zenithColor: 0x009D775F,
          },
        },
      ],
      [
        "Rain",
        {
          params: {
            particleDensity: 0.0026,
            sizeRange: Range1d.createXX(5, 8),
            transparencyRange: Range1d.createXX(0, 70),
            velocityRange: new Range2d(-30, 700, 30, 1000),
            accelerationRange: new Range2d(-1, -1, 1, 10),
            windVelocity: 0,
          },
          textureUrl: optionRainParticle === 1 ? "./particle_rain.png" : "./particle_rain2.png",
          skyStyle: {
            groundColor: 0x00697D62,
            nadirColor: 0x0053604F,
            skyColor: 0x009E7853,
            zenithColor: 0x00775839,
          },
        },
      ],
    ],
  );
}
