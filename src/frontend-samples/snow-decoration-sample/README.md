# Particle Effect - Snow

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample shows how to create a particle effect using snow as an example.

## Purpose

The purpose of this sample is to demonstrate the following:

* Creating a decorator and rendering it in the active view.
* Working with particle effects using the [ParticleCollectionBuilder](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/particlecollectionbuilder) API.

## Description

This sample provides an example of a particle effect in view space (as opposed to world space).  The sample provides features to configure a decorator emitting snow particles.  The decorator is creating using predefined props defined in [SnowDecorationApp.ts](./SnowDecorationApp.tsx).  Select which effect is used with the drop down menu.

For a basic decorator, the [Decorator](https://www.itwinjs.org/reference/imodeljs-frontend/views/decorator/) interface is implemented. The decorate method adds the [RenderGraphics](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/rendergraphic/) to the given [DecorateContext](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/decoratecontext). Once the decorator is created, pass it to the [ViewManager.addDecorator](https://www.itwinjs.org/reference/imodeljs-frontend/views/viewmanager/adddecorator/) method to have it rendered in all active views. This sample is specifically for working with particle effects. For examples of other decorators, see [Heatmap Decorator Sample](https://www.itwinjs.org/sample-showcase/?group=Viewer+Features&sample=heatmap-decorator-sample&imodel=Metrostation+Sample) and this sample's [HighlightEmitter](./FireDecorator.ts).  For another sample using particles in a decorator, see [Particle Decoration (Fire)](https://www.itwinjs.org/sample-showcase/?group=Viewer+Features&sample=fire-sample).

Inside the decorate method, [ParticleCollectionBuilder.create](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/particlecollectionbuilder/particlecollectionbuilder.create/) is called to create a builder for the particles.  Each particle is added to this builder and implements the [ParticleProps](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/particleprops/?term=partic) interface.
The texture for each particle is loaded by the sample, and owned by the decorator.  When the sample disposes, it signals the decorator is also dispose of the texture.

For this sample, each particle is updated before being rendered.  All updates are scaled by a time delta to smooth any inconsistent times between updates.  To ensure the decorators are always rendered by the viewport, an event listener is added to the [Viewport.onRender](https://www.itwinjs.org/reference/imodeljs-frontend/views/viewport/?term=onrender#onrender) event that invalidates the decorators.  This will force them to re-render with each frame.

Notes:

* This is in no way a simulation.  The weather presented only serves as a visual effect.
* The APIs related to particles are in beta.  Please consulate the latest documentation before adapting for your own projects.
