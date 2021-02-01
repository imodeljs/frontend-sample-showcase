# Exploded View Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample shows how to create an exploded view effect in the viewport.

## Purpose

The main purpose is give an example of how to create the exploded view effect.  To achieve this it also shows how to:

* Request specific elements and tiles from the backend.
* Work with transforms.
* Render customized graphics.

## Description

To create the exploded view effect, we will request specific element graphics from the backend each with a different translation matrix in order to move them apart.

Steps:
- For each element calculate the transform from the origin.  Do this by querying the origin and orientation from the backend using the [iModelConnect.query(...)]() method and passing that to the [Placement3d]() API.  Also, query the bounding box for each element for use in the next step.
- Again for each element calculate the desired offset.  This is done by finding the center of the group of elements, and subtracting that from the center of mass for each element.  Create a [Range3d]() using the bounding box.  Union all the ranges to compute the center of the group.  Create a translation transform using [Transform.createTranslation(...)]()
- With the new translation matrix, request updated tiles from the backend using [IModelTileRpcInterface.requestElementGraphics(...)]().  Once they are loaded, they are handed to a custom graphics provider.  The custom provider implements [FeatureOverrideProvider]() to hide the original element graphics and [TiledGraphicsProvider]() to display the updated tiles.

Note: The [TiledGraphicsProvider](https://www.imodeljs.org/reference/imodeljs-frontend/views/tiledgraphicsprovider/) is in beta.
