# Reality Data Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how find reality data models and attach them to the Viewport.

## Purpose

The purpose of this sample is to demonstrate the following:

- Find all available reality models in an iModel.
- Attach reality models to a Viewport.
- Detach reality models from a Viewport.
- Adjust feature appearance overrides on the reality models.

## Description

The first step is to discover available reality models. This sample uses `getRealityDatas` from the `@itwin/reality-data-client` package. Next, call [`attachRealityModel`](https://www.itwinjs.org/reference/core-frontend/views/displaystylestate/attachrealitymodel/) on the `DisplayStyleState` of the current Viewport.

To detach use `detachRealityModelByNameAndUrl` with the name and url of the reality model you wish to detach. Another option is to use `detachRealityModelByIndex`. This sample turns on/off _all_ reality models of an iModel with a toggle. To do this `forEachRealityModel` is used to iterate over all reality models in the `DisplayStyleState`.

To adjust various [`FeatureAppearance`](https://www.itwinjs.org/reference/core-common/rendering/featureappearance/) overrides (transparency, nonLocatable, color, or emphasized), use [`ContextRealityModel.appearanceOverrides`](https://www.itwinjs.org/reference/core-common/displaystyles/contextrealitymodel/appearanceoverrides/).
