# Particle Effect - Fire

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample shows how to create a particle effect using fire as an example.

## Purpose

The purpose of this sample is to demonstrate the following:

* Creating a decorator and rendering it in the active view.
* Working with particle effects using the [ParticleCollectionBuilder](https://www.itwinjs.org/reference/core-frontend/rendering/particlecollectionbuilder) API.
* Adding a tool tip to a particle decorator.
* Visualizing (NOT simulating) fire in an iModel.

## Description

This sample provides an example of a particle effect in world space (as opposed to view space). The sample provides features to place and configure fire particle emitters.  Each emitter is initially configured based on preset parameters defined in [FireDecorationApp.tsx](./FireDecorationApp.tsx).  Select which preset is used with the dropdown menu.  This sample does not demonstrate a way to configure an emitter after it has been deselected.

For a basic decorator, the [Decorator](https://www.itwinjs.org/reference/core-frontend/views/decorator/) interface is implemented. The decorate method adds the [RenderGraphics](https://www.itwinjs.org/reference/core-frontend/rendering/rendergraphic/) to the given [DecorateContext](https://www.itwinjs.org/reference/core-frontend/rendering/decoratecontext). Once the decorator is created, pass it to the [ViewManager.addDecorator](https://www.itwinjs.org/reference/core-frontend/views/viewmanager/adddecorator/) method to have it rendered in all active views. This sample is specifically for working with particle effects. For examples of other decorators, see [Heatmap Decorator Sample](../heatmap-decorator-sample/readme.md) and this sample's [HighlightEmitter](./FireDecorator.ts).  For another sample using particles in a decorator, see [Particle Effect (Snow & Rain)](../snow-rain-sample/README.md).

Inside the decorate method, [ParticleCollectionBuilder.create](https://www.itwinjs.org/reference/core-frontend/rendering/particlecollectionbuilder/particlecollectionbuilder.create/) is called to create a builder for the particles.  Each particle is added to this builder and implements the [ParticleProps](https://www.itwinjs.org/reference/core-frontend/rendering/particleprops/?term=partic) interface.  For efficient memory usage, the textures used by the decorator are shared and are disposed of when not in use.

For this sample, each particle is updated before being rendered.  All updates are scaled by a time delta to smooth any inconsistent times between updates.  To ensure the decorators are always rendered by the viewport, an event listener is added to the [Viewport.onRender](https://www.itwinjs.org/reference/core-frontend/views/viewport/?term=onrender#onrender) event that invalidates the decorators.  This will force them to re-render with each frame.

The tooltip is created by assigning a [transient id](https://www.itwinjs.org/reference/core-frontend/imodelconnection/imodelconnection/?term=transientids#transientids) from the iModel to the particle builder. This allows for locating within the iModel. [testDecoratorHit](https://www.itwinjs.org/reference/core-frontend/views/decorator/testdecorationhit/) confirms that the given unique id belongs to the emitter, and [getDecoratorToolTip](https://www.itwinjs.org/reference/core-frontend/views/decorator/getdecorationtooltip/) returns an HTML element used as the tooltip.

Notes:

* This is in no way a smoke or fire simulation.  The fire presented only serves as a visual effect.
* The APIs related to particles are in beta.  Please consult the latest documentation before adapting for your own projects.
