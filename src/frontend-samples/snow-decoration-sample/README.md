# Particle Effect - Snow & Rain

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample shows how to create particle effects using snow and rain as examples.

## Purpose

The purpose of this sample is to demonstrate the following:

* Creating a decorator and rendering it in the active view.
* Working with particle effects using the [ParticleCollectionBuilder](https://www.itwinjs.org/reference/core-frontend/rendering/particlecollectionbuilder) API.
* Create a particle with a dynamic texture.

## Description

This sample provides an example of a particle effect in view space (as opposed to world space).  The sample provides features to configure a decorator emitting snow particles.  The decorator is created using predefined props defined in [SnowDecorationApi.tsx](./SnowDecorationApi.tsx).  Select which effect is used with the drop down menu.
The "Rain (Circular)" effect uses a single texture image to create its effect.  The "Rain (Raindrop)" effect uses multiple texture images.  It will change between them based on the strength of the wind.  These different textures make the rain particles face where they are falling.

For a basic decorator, the [Decorator](https://www.itwinjs.org/reference/core-frontend/views/decorator/) interface is implemented. The decorate method adds the [RenderGraphics](https://www.itwinjs.org/reference/core-frontend/rendering/rendergraphic/) to the given [DecorateContext](https://www.itwinjs.org/reference/core-frontend/rendering/decoratecontext). Once the decorator is created, pass it to the [ViewManager.addDecorator](https://www.itwinjs.org/reference/core-frontend/views/viewmanager/adddecorator/) method to have it rendered in all active views. This sample is specifically for working with particle effects. For examples of other decorators, see [Heatmap Decorator Sample](../heatmap-decorator-sample/readme.md).  For another sample using particles in a decorator, see [Particle Decoration (Fire)](../fire-sample/README.md).

Inside the decorate method, [ParticleCollectionBuilder.create](https://www.itwinjs.org/reference/core-frontend/rendering/particlecollectionbuilder/particlecollectionbuilder.create/) is called to create a builder for the particles.  Each particle is added to this builder and implements the [ParticleProps](https://www.itwinjs.org/reference/core-frontend/rendering/particleprops/?term=partic) interface.
The texture for each particle is loaded by the sample, and owned by the decorator.  When the view is closed, it signals the decorator is also dispose of the texture.

For this sample, each particle is updated before being rendered.  All updates are scaled by a time delta to smooth any inconsistent times between updates.  To ensure the decorators are always rendered by the viewport, an event listener is added to the [Viewport.onRender](https://www.itwinjs.org/reference/core-frontend/views/viewport/?term=onrender#onrender) event that invalidates the decorators.  This will force them to re-render with each frame.

Notes:

* This is in no way a simulation.  The weather presented only serves as a visual effect.
* The APIs related to particles are in beta.  Please consult the latest documentation before adapting for your own projects.
