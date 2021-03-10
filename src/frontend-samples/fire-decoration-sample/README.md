# Particle Effect - Fire

Copyright © Bentley Systems, Incorporated. All rights reserved.

This samples show how to create a particle effect using fire as an example.

## Purpose

The purpose of this sample is to demonstrate the following:

* Creating a decorator and rendering it in the active view.
* Working with particle in Decorators using the [ParticleCollectionBuilder](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/particlecollectionbuilder) API.
* The visualizing (NOT simulating) fire in an iModel.

## Description

This sample provides an example of a particle effect in world space (as apposed to view space).  The sample provides a tool to place and controls limitedly configure fire particle emitters.  Each emitter is initially configured based with preset parameters defined in [FireDecorationApp.ts](./FireDecorationApp.tsx).  Select which preset is use with the drop down menu.  Once you have deselected an emitter, there is no way to return to configuring it.

For a basic decorator, the [Decorator](https://www.itwinjs.org/reference/imodeljs-frontend/views/decorator/) interface is implemented. The decorate method adds the [RenderGraphics](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/rendergraphic/) to the given [DecorateContext](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/decoratecontext). Once the decorator is created, pass it in the [ViewManager.addDecorator](https://www.itwinjs.org/reference/imodeljs-frontend/views/viewmanager/adddecorator/) method to have it rendered in all active views. This sample is specifically for working with particle effects. For examples of other decorators, see [Geometry Samples](https://www.itwinjs.org/sample-showcase/?group=Geometry+Samples&sample=simple-line-sample) and this sample's [HighlightEmitter](./FireDecorator.ts).

Inside the decorate method, [ParticleCollectionBuilder.create](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/particlecollectionbuilder/particlecollectionbuilder.create/) is called to create a builder for the particles.  Each particle is added to this builder and implements the [ParticleProps](https://www.itwinjs.org/reference/imodeljs-frontend/rendering/particleprops/?term=partic) interface.  For efficient memory usage, the textures used by the decorator is shared by all of them, and is disposed of when not used.

For this sample, each particle is updated before being rendered.  All updates are scaled by a time delta to smooth any inconsistent times between between updates.  To ensure the decorators are always rendered by the viewport, an event listener is added to the [Viewport.onRendered](https://www.itwinjs.org/reference/imodeljs-frontend/views/viewport/?term=onrender#onrender) event that invalidates the decorators.  This will force them to rerender with each frame.

The tool tip is created by assigning a [transient id](https://www.itwinjs.org/reference/imodeljs-frontend/imodelconnection/imodelconnection/?term=transientids#transientids) from the IModel to the particle builder. This allows for locating within the iModel. [testDecoratorHit](https://www.itwinjs.org/reference/imodeljs-frontend/views/decorator/testdecorationhit/) confirms that the given unique id belongs to the emitter, and [getDecoratorToolTip](https://www.itwinjs.org/reference/imodeljs-frontend/views/decorator/getdecorationtooltip/) returns an HTML element used as the tool tip.

Notes:

* This is in no way a smoke or fire simulation, and only serves as a visual effect.
* The APIs related to particles are in beta.  Please consulate the latest documentation before adapting for your own projects.
