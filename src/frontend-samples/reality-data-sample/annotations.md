# View Setup

View setup used by all samples and an iModel selector from `useSampleWidget`.

[_metadata_:annotation]:- "VIEW_SETUP"

# Viewer Component

`<Viewer>` component from itwin-viewer-react to display the iModel.

[_metadata_:annotation]:- "VIEWER"
[_metadata_:skip]:- "true"

# Sample State

This sample has two state members - Whether to show reality data (defaults to true), and the level of transparency (defaults to 0).

[_metadata_:annotation]:- "STATE"

# Initial State Hook

We want the reality data to be displayed on when the viewer loads. This hook uses the onViewOpen `BeUiEvent` to toggle _on_ the reality model and sets the transparency to _0_. Next, we will look at how those two methods work.

[_metadata_:annotation]:- "INITIAL_STATE"

# Transparency

This method sets the reality model transparency. This is done by getting the current reality model appearance overrides and overriding with the desired transparency.

[_metadata_:annotation]:- "TRANSPARENCY"

# Appearance

First, we get any reality model `FeatureAppearance`s on the viewport by calling `getRealityModelAppearanceOverride`. For this sample, we wish to affect the appearance of *all* reality models. Therefore we use -1 as the index. In practice, there may be several reality models attached to the viewport, in that case the index of the reality model having it's appearance overridden should be used.

[_metadata_:annotation]:- "APPEARANCE"

# Overrides

If an existing override was found, `clone` it and set the transparency to the desired value. Otherwise, use `FeatureAppearance.fromJSON` to create a `FeatureAppearance` with `transparency` set to the desired value.

[_metadata_:annotation]:- "OVERRIDES"

# Show Reality toggle

This method turns on or off the reality model.

[_metadata_:annotation]:- "REALITY_TOGGLE_CALLBACK"

# Turn on a Reality Model

Turning on a reality model. If `orbitGTBlob` is defined, this reality model is a Point Cloud, and the `orbitGTBlob` object must be re-formed. Next, the `ContextRealityModelProps` is attached to the `viewPort` using `viewPort.displayStyle.attachRealityModel()`.

[_metadata_:annotation]:- "REALITY_MODEL_ON"

# Turn off a Reality Model

Turning off a reality model. Reality models are detached using [`DisplayStyleState.detachRealityModelByNameAndUrl`](https://www.itwinjs.org/reference/core-frontend/views/displaystylestate/detachrealitymodelbynameandurl/).

[_metadata_:annotation]:- "REALITY_MODEL_OFF"

# UI Items Provider

The `UiItemsProvider` that provides the widget for this example.

[_metadata_:annotation]:- "UI_ITEMS_PROVIDER"
[_metadata_:skip]:- "true"

# Widget UI

The `React.FunctionComponent` returned by the widget. This example has a toggle for turning on/off and a slider for setting the transparency of the reality data model.

[_metadata_:annotation]:- "WIDGET_UI"
[_metadata_:skip]:- "true"

# Reality Data Toggle

A toggle that sets `showRealityDataState`

[_metadata_:annotation]:- "REALITY_TOGGLE"

# Reality Data Hook

A hook with `showRealityDataState` and `updateAttachedState` as deps. `RealityDataApi.toggleRealityModel` is called, then the transparency is set.

[_metadata_:annotation]:- "REALITY_HOOK"

# Transparency Hook

A hook with `transparencyRealityDataState` and `updateTransparencyState` as deps. `RealityDataApi.setRealityDataTransparency` is called with the current state value of the transparency.

[_metadata_:annotation]:- "TRANSPARENCY_HOOK"
