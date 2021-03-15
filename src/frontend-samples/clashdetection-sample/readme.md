# Clash Detection Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

Clash Detection is a feature in iTwin Platform that analyzes and reports element pairs that are colliding or within a minimum tolerance. An API now provides direct access to this functionality to enable 3rd-party app integration.

This sample demonstrates calling [Clash Detection APIs](https://developer.bentley.com/api-groups/project-delivery/apis/validation/operations/get-validation-clashdetection-result) to retrieve clash data and present it for review in a viewer app. 

## Purpose

- Plot clash locations using marker pins.
- Populate table of clashes.
- Visualize clashing element pair using red, blue and gray-out.
- Zoom to clash on marker click or table selection.
- Provide [code examples](./ClashDetectionApis.ts) for calling the Clash Detection APIs.

## Description

The goal of this sample is to provide example functions for all of the available Clash Detection APIs.  In fact, two of the example functions are called to populate the clash results table and plot the clash markers. [Clash Detection result sample data](./ClashDetectionJsonData.ts) is also provided to show the format of the data returned from the API.

The following [iTwin.js library](https://www.itwinjs.org/reference/) components are demonstrated:

- [Decorator](https://www.itwinjs.org/reference/imodeljs-frontend/views/decorator/): show the clash marker pins in a viewport.
- [MarkerSet](https://www.itwinjs.org/reference/imodeljs-frontend/views/markerset/): manage a collection of clash marker pins.
- [Marker](https://www.itwinjs.org/reference/imodeljs-frontend/views/marker/): draw clash marker pins at the location of clashing elements.
- [Cluster](https://www.itwinjs.org/reference/imodeljs-frontend/views/cluster/): draw cluster pins where a group of clashes are located.
- [Table](https://www.itwinjs.org/reference/ui-components/table/): display a table of clash results.
