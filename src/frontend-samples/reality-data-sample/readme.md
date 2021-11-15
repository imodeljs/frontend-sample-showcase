# Reality Data Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how find reality data models and attach them to the Viewport.

## Purpose

The purpose of this sample is to demonstrate the following:

* Find all available reality models in an iModel.
* Attach reality models to a Viewport.
* Detach reality models from a Viewport.
* Adjust feature appearance overrides on the reality models.

## Description

The first step is to discover available reality models. This sample uses `queryRealityData` from the `imodeljs-frontend` package. Next, call [`attachRealityModel`](https://www.itwinjs.org/reference/imodeljs-frontend/views/displaystylestate/attachrealitymodel/) on the `DisplayStyleState` of the current Viewport.

To detach use `detachRealityModelByNameAndUrl` with the name and url of the reality model you wish to detach. Another option is to use `detachRealityModelByIndex`. This sample turns on/off *all* reality models of an iModel with a toggle. To do this `forEachRealityModel` is used to iterate over all reality models in the `DisplayStyleState`.

To adjust various [`FeatureAppearance`](https://www.itwinjs.org/reference/imodeljs-common/rendering/featureappearance/) overrides (transparency, nonLocatable, color, or emphasized), use [`ContextRealityModel.appearanceOverrides`](https://www.itwinjs.org/reference/imodeljs-common/displaystyles/contextrealitymodel/appearanceoverrides/).
