# Swiping Comparison Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to compare two different views using a single viewport.

## Purpose

The purpose of this sample is to demonstrate the following:

* Convert a point from screen space to world space.
* Create a TiledGraphicsProvider.
* Attach a TiledGraphicsProvider.
* Adjust view settings like the clip and feature overrides in a TiledGraphicsProvider.

## Description

The comparison works by effectively rendering 2 separate halves of a scene.  A [clipping plane](../view-clip-sample/readme.md) is attached to the viewport to divide the scene and a [TiledGraphicsProvider](https://www.itwinjs.org/reference/core-frontend/views/tiledgraphicsprovider/) is used to negate the normal of the clipping plane and inject the other half of the scene.
