[_metadata_:file]:- "RealityDataApp.tsx"
[_metadata_:start]:- "16"
[_metadata_:end]:- "22"
[_metadata_:skip]:- "true"

# View Setup

View setup used by all samples and an iModel selector from `useSampleWidget`.

[_metadata_:file]:- "RealityDataApp.tsx"
[_metadata_:start]:- "28"
[_metadata_:end]:- "37"
[_metadata_:skip]:- "true"

# Viewer Component

`<Viewer>` component from itwin-viewer-react to display the iModel.

[_metadata_:file]:- "RealityDataWidget.tsx"
[_metadata_:start]:- "16"
[_metadata_:end]:- "17"

# Sample State

This sample has two state members - Whether to show reality data (defaults to true), and the level of transparency (defaults to 0).

[_metadata_:file]:- "RealityDataWidget.tsx"
[_metadata_:start]:- "19"
[_metadata_:end]:- "26"

# Reality Data

We want the reality data to be displayed on when the viewer loads. This hook uses the onViewOpen `BeUiEvent` to toggle _on_ the reality model and sets the transparency to _0_. Next, we will look at how those two methods work.

[_metadata_:file]:- "RealityDataApi.ts"
[_metadata_:start]:- "40"
[_metadata_:end]:- "45"

# Transparency

This method sets the reality model transparency. This is done by getting the current reality model appearance overrides and overriding with the desired transparency.

[_metadata_:file]:- "RealityDataApi.ts"
[_metadata_:start]:- "43"
[_metadata_:end]:- "43"

# Appearance

First, we get any reality model `FeatureAppearance`s on the viewport by calling `getRealityModelAppearanceOverride`. For this sample, we wish to affect the appearance of *all* reality models. Therefore we use -1 as the index. In practice, there may be several reality models attached to the viewport, in that case the index of the reality model having it's appearance overridden should be used.

[_metadata_:file]:- "RealityDataApi.ts"
[_metadata_:start]:- "44"
[_metadata_:end]:- "44"

# Overrides

If an existing override was found, `clone` it and set the transparency to the desired value. Otherwise, use `FeatureAppearance.fromJSON` to create a `FeatureAppearance` with `transparency` set to the desired value.

[_metadata_:file]:- "RealityDataApi.ts"
[_metadata_:start]:- "14"
[_metadata_:end]:- "38"

# Show Reality toggle

This method turns on or off the reality model depending on the `showReality` argument.

[_metadata_:file]:- "RealityDataApi.ts"
[_metadata_:start]:- "15"
[_metadata_:end]:- "18"

# Display Style

First `clone` the display style currently on the `ScreenViewport`. Turn off the background map by setting the `backgroundMap` viewFlag to false. This is not strictly necessary, but for this sample the Metrostation iModel looks much better without the background map.

[_metadata_:file]:- "RealityDataApi.ts"
[_metadata_:start]:- "20"
[_metadata_:end]:- "27"

# Turn on a Reality Model

Turning on a reality model. This sample uses [`findAvailableUnattachedRealityModels`](https://github.com/imodeljs/imodeljs/blob/master/core/frontend/src/ContextRealityModelState.ts#L132) from the imodeljs-frontend package to get unattached `ContextRealityModelProps`. If any `ContextRealityModelProps` are returned, this sample finds the first and uses `attachRealtyModel` to attach it to the display style. Then set the displayStyle of the viewport to the cloned and edited `style` variable.

[_metadata_:file]:- "RealityDataApi.ts"
[_metadata_:start]:- "28"
[_metadata_:end]:- "37"

# Turn off a Reality Model

Turning off a reality model. Reality models are typically detached using [`DisplayStyleState.detachRealityModelByNameAndUrl`](https://www.itwinjs.org/reference/imodeljs-frontend/views/displaystylestate/detachrealitymodelbynameandurl/). In this example, the name and URL of the attached reality models are not saved. This was done to simplify the sample. Typically, this information is stored in state when the reality model is turned on (attached). So [`DisplayStyleState.forEachRealityModel`](https://www.itwinjs.org/reference/imodeljs-frontend/views/displaystylestate/foreachrealitymodel/) is used to loop through all attached reality models to collect name and URL in `ContextRealityModelState`. In this example, there will only ever be one reality model attached. Then, `DisplayStyleState.detachRealityModelByNameAndUrl` is called. Finally, set the displayStyle of the viewport to the cloned and edited `style` variable. Next, we will cover the controls that call these two methods.

[_metadata_:file]:- "RealityDataWidget.tsx"
[_metadata_:start]:- "83"
[_metadata_:end]:- "101"
[_metadata_:skip]:- "true"

# UI Items Provider

The `UiItemsProvider` that provides the widget for this example.

[_metadata_:file]:- "RealityDataWidget.tsx"
[_metadata_:start]:- "71"
[_metadata_:end]:- "80"
[_metadata_:skip]:- "true"

# React Widget

The `React.FunctionComponent` returned by the widget. This example has a toggle for turning on/off and a slider for setting the transparency of the reality data model.

[_metadata_:file]:- "RealityDataWidget.tsx"
[_metadata_:start]:- "49"
[_metadata_:end]:- "58"

# Reality Data Toggle

A toggle that sets `showRealityDataState`

[_metadata_:file]:- "RealityDataWidget.tsx"
[_metadata_:start]:- "36"
[_metadata_:end]:- "47"

# Reality Data Hook

A hook with `showRealityDataState` as a dep. `RealityDataApi.toggleRealityModel` is called, then the transparency is set.

[_metadata_:file]:- "RealityDataWidget.tsx"
[_metadata_:start]:- "60"
[_metadata_:end]:- "69"

# Transparency Slider

A slider that sets `realityDataTransparencyState`

[_metadata_:file]:- "RealityDataWidget.tsx"
[_metadata_:start]:- "28"
[_metadata_:end]:- "34"

# Transparency Hook

A hook with `realityDataTransparencyState` as a dep. `RealityDataApi.setRealityDataTransparency` is called with the current state value of the transparency.
