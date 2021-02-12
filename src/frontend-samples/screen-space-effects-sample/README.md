# Screen-space Effects Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to create and apply screen-space effects to a viewport.

## Purpose

The purpose of this sample is to demonstrate the following:

* How to define and register a screen-space effect that alters the image rendered by a viewport.
* How to add and remove such effects from a viewport.

## Description

This sample provides three examples of screen-space effects that are used to alter the image produced by a viewport. Each effect has one or more parameters that can adjusted using sliders to customize the effect.
* Saturation: increases or decreases the saturation of each pixel.
* Lens Distortion: simulates the "fish-eye" effect produced by physical cameras with wide fields of view.
* Vignette: reduces the brightness around the periphery of the image

The effects are defined using a [ScreenSpaceEffectBuilder](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/screenspaceeffectbuilder) and applied to the viewport using [Viewport.addScreenSpaceEffect](https://www.itwinjs.org/reference/imodeljs-frontend/views/viewport/addscreenspaceeffect). Note: any number of screen-space effects can be applied to the same viewport at any given time - this sample applies only one at a time.

This sample incidentally also demonstrates how to adjust the lens angle of a viewport's camera using [Viewport.turnCameraOn](https://www.itwinjs.org/reference/imodeljs-frontend/views/viewport/turncameraon).
