# Explode Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample shows how to create an explosion effect in the viewport.

## Purpose

The main purpose is give an example of how to create the explosion effect.  To achieve this it also shows how to:

* Request specific elements and tiles from the backend.
* Work with transforms.
* Rendering custom graphics.

## Description

To create the explosion effect, we will request the original graphics from the backend with a translation matrix moving it away from the other elements.

First, the transform of the elements from the origin to their original placement must be calculated.  This can be done by querying the origin and orientation from the backend using the [iModelConnect.query(...)]() method and passing that to the [Placement3d]() API.
Second, the direction of offset must be calculated.  This can be found by finding the center of all elements combine, and subtracting that from the center of mass for each element.  This is easily done by also query the bounding boxes during the previous step and create a [Range3d]() using those points.  The center of all elements combined can be found by finding the union of all the ranges or creating a new range that includes all the bounding points of the individual elements.  A translation transform can be create from this using [Transform.createTranslation(...)]()
Third, with the new translation matrix, updated tiles need to be requested from the backend using the [IModelTileRpcInterface.requestElementGraphics(...)]() method.  Once they are loaded, they are handed the a provider which will hide the original graphics and insert the updated tiles.  This provider is used as both a [TiledGraphicsProvider]() and a [FeatureOverrideProvider]()

Note: The [TiledGraphicsProvider](https://www.imodeljs.org/reference/imodeljs-frontend/views/tiledgraphicsprovider/) is in beta.
