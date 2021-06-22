# Welcome

This panel will give you a guided tour of the Marker Pins code sample.  Please use the &#x02192; button below to start the tour.  Or you can browse through and jump directly to any step using the control above.  During the tour, the &#x025ef;  button will recenter the code editor.

[_metadata_:annotation]:- "VIEW_SETUP"

# Viewer Setup

This sample consists of a single [functional REACT component](https://reactjs.org/docs/components-and-props.html) named `ViewportOnlyApp`.  This component uses the hook `useSampleWidget` which is delivered as part of the sample environment.  The hook takes care of adding a widget which shows the sample instructions and also a picker to select among the example iModels.  The hook returns the contextId and iModelId used to identify the iModel.

[_metadata_:annotation]:- "VIEW_SETUP"

# Viewer Component

The `<Viewer>` component is responsible for creating the viewport, which displays the iModel geometry, and also all the embedded user interface components such as tools and widgets.

There are a few required props including `contextId`, `iModelId`, and `authConfig`.  We also supply the following optional props:

- `viewportOptions` : set up the initial view appearance
- `defaultUiConfig` : initialize the user interface
- `theme` : we prefer dark theme
- `onIModelConnected` : to get a callback as soon as the iModel is ready

The `<Viewer>` component is only returned if the context and imodel ids are valid.

[_metadata_:annotation]:- "VIEWER"
[_metadata_:skip]:- "true"
