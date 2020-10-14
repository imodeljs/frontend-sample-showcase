# Reality Data Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how find reality data models and attach them to the Viewport.

## Purpose

The purpose of this sample is to demonstrate the following:

* Find all available reality models in an iModel.
* Attach reality models to a Viewport.
* Detach reality models from a Viewport.

## Description

The first step is to call `findAvailableUnattachedRealityModels` from the `imodeljs-frontend` package. This returns reality models available in an iModel. Next, call [`attachRealityModel`](https://www.imodeljs.org/reference/imodeljs-frontend/views/displaystylestate/attachrealitymodel/) on the `DisplayStyleState` of the current Viewport. To detach use `detachRealityModelByNameAndUrl` with the name and url of the reality model you wish to detach. `detachRealityModelByIndex` is another option. This example turns on/off *all* reality models of an iModel with a toggle. To do this `forEachRealityModel` is used to iterate over all reality models in the `DisplayStyleState`.
