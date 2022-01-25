# Exploded View Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample shows how to create an exploded view effect in the viewport.

## Purpose

The main purpose is to give an example of how to create the exploded view effect.  To achieve this, it also shows how to:

* Request specific elements and tiles from the backend.
* Work with [Transforms](https://www.itwinjs.org/v2/learning/geometry/transform/).
* Render customized graphics using a TileTree.
* Add a simple [Animator](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/animator/) to a viewport.
* NOT as an example of generalized animation.

## Description

To create the exploded view effect, we request specific element graphics from the backend and draw them with a translation in order to move them apart.  Most of this is handled by the [TileTree](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tiletree/) and [Tile](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tile/) APIs, and communicated through a [TiledGraphicsProvider](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/tiledgraphicsprovider/) and [TileTreeReference](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tiletreereference/).  I am omitting most of the logic about the tile hierarchy.  See the inline comments and documentation for more information.

1. The first goal is to load graphics content.  This is mostly handled by the [TileTree](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tiletree/?term=tiletree) logic and our custom [Tile](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tile/) objects. Our graphics tiles use the [IModelTileRpcInterface](https://www.itwinjs.org/v2/reference/imodeljs-common/rpcinterface/imodeltilerpcinterface/).requestElementGraphics via the [TileAdmin](https://github.com/imodeljs/imodeljs/blob/master/core/frontend/src/tile/TileAdmin.ts) to request graphics from the backend and read it using a [ImdlReader](https://github.com/imodeljs/imodeljs/blob/master/core/frontend/src/tile/ImdlReader.ts). The request requires a tolerance (how detailed the element's geometry is).  This is calculated in the element tile based on the tile's distance from the camera.  We add our tile tree to the viewport by using the [TiledGraphicsProvider.forEachTileTreeRef](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/tiledgraphicsprovider/) method.

2. The second goal is to displace the elements based on the explode scaling.  While loading the tile tree, we query the backend for the origin and the element-space bounding box of each element using the [iModelConnection.query](https://www.itwinjs.org/v2/reference/imodeljs-frontend/imodelconnection/imodelconnection/query/). We create transform into world space using the [Placement3d](https://www.itwinjs.org/v2/reference/imodeljs-common/geometry/placement3d/) API with the element's origin and apply (multiply) it by the queried bounding box.  This moves the bounding box from element space to world space.  In our root tile, we then combine each bounding box using the [Range3d.extendRange](https://www.itwinjs.org/v2/reference/geometry-core/cartesiangeometry/range3d/) method.  In each graphics tile, we create a vector by subtracting the center of each element's bounding box from the center of the box combining them all.  This vector is the direction the element should be displaced.  This is then scaled by the explode scaling and used to create a translation transform using the [Transform](https://www.itwinjs.org/v2/reference/geometry-core/cartesiangeometry/transform/) API.

3. The third goal is to draw the graphics displaced by the previously calculated transform.  This is done by overriding the [Tile.drawGraphics](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tile/?term=drawgr#drawgraphics) method of our graphics tile.  Create a new [GraphicsBranch](https://www.itwinjs.org/v2/reference/imodeljs-frontend/rendering/graphicbranch/) using [RenderContext](https://www.itwinjs.org/v2/reference/imodeljs-frontend/rendering/rendercontext/).createGraphicBranch and pass in the translation and an argument.  These graphics are drawn in the [TileTree.draw](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tiledrawargs/) by the [TileDrawArgs](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tiledrawargs/).drawGraphics method. Note: here that the [TileDrawArgs](https://www.itwinjs.org/v2/reference/imodeljs-frontend/tiles/tiledrawargs/) used have been extended to include the scaling for the translation matrix.

4. Now that the modified elements are being drawn, the old, static elements need to be hidden.  This is done with two parts working together.  First, a [FeatureOverrideProvider](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/viewport/featureoverrideprovider/) added to the viewport monitors the modified elements. Once they have tile content loaded, the ElementIds are marked to never be drawn using the [FeatureOverride.setNeverDrawnSet](https://www.itwinjs.org/v2/reference/imodeljs-common/rendering/featureoverrides/) method.  The second part is a [FeatureAppearanceProvider](https://www.itwinjs.org/v2/reference/imodeljs-common/rendering/featureappearanceprovider/) being applied in the previously mentioned call to [RenderContext](https://www.itwinjs.org/v2/reference/imodeljs-frontend/rendering/rendercontext/).createGraphicBranch.  This provider ensures the elements relative to our tile tree are drawn by return a default [FeatureAppearance](https://www.itwinjs.org/v2/reference/imodeljs-common/rendering/featureappearance/) for our modified elements.

5. The [EmphasizeElements](https://www.itwinjs.org/v2/reference/imodeljs-frontend/rendering/emphasizeelements/) API is used to Isolate the objects in the sample.  For more information see the [Emphasize Elements Sample](https://www.itwinjs.org/v2/sample-showcase/?group=Viewer+Features&sample=emphasize-elements-sample) of that topic.

Notes:

* Many of the APIs used in this sample are still in beta and alpha, especially those related to the tiles.  Please check the latest documentation for changes before adapting for your own purposes.
* Much of this logic is based on the [DynamicIModelTile](https://github.com/imodeljs/imodeljs/blob/master/core/frontend/src/tile/DynamicIModelTile.ts) of iModel.js.
* The workflow used in this sample does not scale.  While doing this with a low number of elements works well, the performance can quickly fall off when affecting hundreds of elements.
