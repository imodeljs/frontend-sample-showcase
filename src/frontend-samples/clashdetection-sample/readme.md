# Clash Review Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how Clash Detection data can be presented for review in a viewer. It also includes code examples for calling the Clash Detection API to retrieve the clash data.


## Purpose

- Plot clash locations using place marker pins.
- Populate table of clashes.
- Visualize clashing element pair using red, blue and gray-out.
- Zoom to clash on marker click or table selection.
- Provide [code examples](./ClashDetectionApis.ts) for calling the Clash Detection APIs.

## Description

The goal of this sample is to demonstrate calling the Clash Detection APIs. Currently, the APIs cannot be called within this sample showcase due to an incompatible authorization token (a user token is required). Therefore, hard-coded clash detection result data is used. This sample provides example functions for getting clash tests, run metadata and results as well as running a clash detection test. 

The following [iTwin.js library](https://www.itwinjs.org/reference/) components are demonstrated:

- [Decorator](https://www.itwinjs.org/reference/imodeljs-frontend/views/decorator/): show the clash marker pins in a viewport.
- [MarkerSet](https://www.itwinjs.org/reference/imodeljs-frontend/views/markerset/): manage a collection of clash marker pins.
- [Marker](https://www.itwinjs.org/reference/imodeljs-frontend/views/marker/): draw clash marker pins at the location of clashing elements.
- [Cluster](https://www.itwinjs.org/reference/imodeljs-frontend/views/cluster/): draw cluster pins where a group of clashing elements are located.
- [Table](https://www.itwinjs.org/reference/ui-components/table/): display a table of clash results.
