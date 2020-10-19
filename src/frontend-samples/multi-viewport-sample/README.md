# Multiple Viewport Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates displaying two viewports displaying the same 3d models.

## Purpose

The purpose of this sample is to demonstrate the following:

* The logic needed to balance multiple viewports.
* How to use the Two-way viewport sync feature.

## Description

When views are synchronized any changes to the properties [ViewState](https://www.imodeljs.org/reference/imodeljs-frontend/views/viewstate/) of either viewport will be immediately applied to the other.  This is done by calling `connect` on [TwoWayViewportSync](https://www.imodeljs.org/reference/imodeljs-frontend/views/twowayviewportsync). One intended use of this feature is for comparing different changesets of the same IModel. Using it that way has the potential for showing the changes over time.
Note: At the time this sample was written [TwoWayViewportSync](https://www.imodeljs.org/reference/imodeljs-frontend/views/twowayviewportsync) was in beta.

`IModelApp.viewManager` includes the events [`onViewOpen`](https://www.imodeljs.org/reference/imodeljs-frontend/views/viewmanager/onviewopen/) and [`onViewClose`](https://www.imodeljs.org/reference/imodeljs-frontend/views/viewmanager/onviewclose/).  Any Listeners added to these events will need to be removed when they are no longer need. If not, they will continue to trigger until the `imodeljs-frontend` package is no longer loaded.
Note: This sample uses `listenForAppTeardown` to track the when the view closes instead of the typical [`onViewClose`](https://www.imodeljs.org/reference/imodeljs-frontend/views/viewmanager/onviewclose/) due to limitations from running as part of a suite of samples.  If [`onViewClose`](https://www.imodeljs.org/reference/imodeljs-frontend/views/viewmanager/onviewclose/) was used, it would be implemented the same as the [`onViewOpen`](https://www.imodeljs.org/reference/imodeljs-frontend/views/viewmanager/onviewopen/), but the sample UI would only remove the viewport with the matching viewportId from the state instead of resetting the whole state.
