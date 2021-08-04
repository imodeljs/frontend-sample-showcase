# Transformations Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to use the Transformations API by displaying the changes in two viewports.

## Purpose

The purpose of this sample is to demonstrate the following:

* How to use the 
* The logic needed to balance multiple viewports.
* How to use the Two-way viewport sync feature.

## Description

When views are synchronized any changes to the properties [ViewState](https://www.imodeljs.org/reference/imodeljs-frontend/views/viewstate/) of either viewport will be immediately applied to the other.  This is done by calling `connect` on [TwoWayViewportSync](https://www.imodeljs.org/reference/imodeljs-frontend/views/twowayviewportsync). One intended use of this feature is for comparing different changesets of the same IModel. Using it that way has the potential for showing the changes over time.
Note: At the time this sample was written [TwoWayViewportSync](https://www.imodeljs.org/reference/imodeljs-frontend/views/twowayviewportsync) was in beta.
