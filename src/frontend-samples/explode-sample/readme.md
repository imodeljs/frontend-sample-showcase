# Exploded View Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample shows how to create an exploded view effect in the viewport.

## Purpose

The main purpose is give an example of how to create the exploded view effect.  To achieve this it also shows how to:

* Request specific elements and tiles from the backend.
* Work with transforms.
* Render customized graphics using a TileTree.
* NOT as an example of generalized animation.

## Description

To create the exploded view effect, we will request specific element graphics from the backend and draw them with a translation in order to move them apart.  Most of this will be handled by the [TileTree](), and communicated through a [TiledGraphicsProvider]() and [TileTreeReference]().  I am omitting most of the logic behind the tile hierarchy.  See the inline comments and documentation for more information.

1. The first goal is to load graphics content.  This is mostly handled by the [TileTree]() logic. Our graphics tiles use the [IModelTileRpcInterface.requestElementGraphics(...)]() to request graphics from the backend and read it using a [ImdlReader](). The request requires a tolerance (how detailed the element's geometry is).  This is calculated in the element tile based on the tile's distance from the camera.  We add our tile tree to the viewport by using the [TiledGraphicsProvider.forEachTileTreeRef]() method.

2. The second goal is to displace the elements based on the explode scaling.  While loading the tile tree, we query the backend for the origin and the element-space bounding box of each element using the [iModelConnection.query(...)](). We create transform into world space using the [Placement3d]() API with the element's origin and apply (multiply) it by the queried bounding box.  This moves the bounding box from element space to world space.  In our root tile, we then combine each bounding box using the [Range3d.extendRange()]() method.  In each graphics tile, we create a vector by subtracting the center of each element's bounding box from the center of the box combining them all.  This vector is the direction the element should be displaced.  This is then scaled by the explode scaling and used to create a translation transform using the [Transform]() API.

3. The third goal is to draw the graphics displaced by the perviously calculated transform.  This is done by overriding the [Tile.drawGraphics]() method of our graphics tile.  Create a new [GraphicsBranch]() using [RenderContext.createGraphicBranch]() and pass in the translation and an argument.  These graphics are drawn in the [TileTree.draw]() by the [TileDrawArgs.drawGraphics]() method. Note: here that the [TileDrawArgs]() used have been extended to include the scaling for the translation matrix.

4. Now that the modified elements are being drawn, the old, static elements need to be hidden.  This is done with two parts working together.  First, a [FeatureOverrideProvider]() added to the viewport monitors the modified elements. Once they have tile content loaded, the ElementIds are marked to never be drawn using the [FeatureOverride.setNeverDrawnSet()]() method.  Second part is a [FeatureAppearanceProvider]() being applied in the perviously mentioned call to [RenderContext.createGraphicBranch]().  This provider ensures the elements relative to our tile tree are drawn by return a default [FeatureAppearance]() for our modified elements.

5. The [EmphasizeElements]() API is used to Isolate or Emphasize the objects in the sample.  For more information see the [Emphasize Elements Sample](https://www.itwinjs.org/sample-showcase/?group=Viewer+Features&sample=emphasize-elements-sample) of that topic.

Notes:

* Many of the APIs used in this sample are still in beta, especially those related to the tiles.  Please check the latest documentation for changes before adapting for your own purposes.
* Much of this logic is based on the [DynamicIModelTile]() of iModel.js.
* The workflow used in this sample does not scale.  While doing this with a low number of elements works well, the performance can quickly fall off when effecting hundreds of elements.
