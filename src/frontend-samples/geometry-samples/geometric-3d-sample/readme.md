# Geometric 3d Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how create a simple 3d primitives.

## Purpose

The purpose of this sample is to demonstrate the following:

* Create 3d primitives including Box, Cone, Sphere, and TorusPipe.
* Create linear, rotational, and ruled sweeps.
* Create Polyfaces of the primitives above as well as Mitered Pipes, so they can be used as World Decorations.

## Description

This sample demonstrates how to create 3d primitives using [Box](https://www.imodeljs.org/reference/geometry-core/solid/box/), [Cone](https://www.imodeljs.org/reference/geometry-core/solid/cone/), [Sphere](https://www.imodeljs.org/reference/geometry-core/solid/sphere/), and [TorusPipe](https://www.imodeljs.org/reference/geometry-core/solid/toruspipe/). It also shows how to create the three different types of sweeps: [Linear Sweeps](https://www.itwinjs.org/reference/geometry-core/solid/linearsweep/), [Rotational Sweeps](https://www.itwinjs.org/reference/geometry-core/solid/rotationalsweep/), and [Ruled Sweeps](https://www.itwinjs.org/reference/geometry-core/solid/ruledsweep/)

This sample demonstrates how to create 3d forms using [PolyfaceBuilder](https://www.imodeljs.org/reference/geometry-core/polyface/polyfacebuilder/).

This geometry sample, like the others, uses a [BlankConnection](https://www.imodeljs.org/learning/frontend/blankconnection/) to create a viewport without connecting to an iModel.  It displays geometry in the viewport using [view decorations](https://www.imodeljs.org/learning/frontend/viewdecorations/).
