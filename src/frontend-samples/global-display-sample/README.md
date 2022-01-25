# Global Data Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates the display of global data sources and globe-based navigation.

## Purpose

This sample illustrates how to:

* Enable the display of 3d terrain from [Cesium World Terrain](https://cesium.com/content/cesium-world-terrain/).
* Change the type of [Bing Maps](https://www.microsoft.com/en-us/maps) imagery displayed.
* Enable the display of 3d building meshes from [Open Street Map](https://cesium.com/content/cesium-osm-buildings/).
* Transcode a place name into a cartographic point.
* Trigger a fly-over animation from one point on the globe to another.

## Description

The terrain and map imagery type are controlled using [Viewport.changeBackgroundMapProps](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/viewport/changebackgroundmapprops). When terrain is enabled, the satellite map imagery provided by Bing Maps is projected on 3d terrain meshes provided by Cesium World Terrain. When terrain is disabled, the map is projected onto the smooth surface of the globe.

The display of the buildings is controlled using [Viewport.displayStyle.setOSMBuildingDisplay](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/displaystylestate/setosmbuildingdisplay/). Hovering the mouse over a building will produce a tooltip containing various information such as the address, type of building, etc. The edges of the buildings are toggled by changing the `visibleEdges` property of the viewport's [ViewFlags](https://www.itwinjs.org/v2/reference/imodeljs-common/displaystyles/viewflags).

Converting the text typed into the "destination" box into a cartographic location involves first obtaining the latitude and longitude from a [BingLocationProvider](https://github.com/imodeljs/imodeljs/blob/master/core/frontend/src/BingLocation.ts), then using `queryTerrainElevationOffset` to determine the ground height at that point. The travel animation is invoked using `Viewport.animateFlyoverToGlobalLocation`.
