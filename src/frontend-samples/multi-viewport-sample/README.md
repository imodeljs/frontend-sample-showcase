# Multiple Viewport Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates displaying two viewports displaying the same 3d models.

## Purpose

The purpose of this sample is to demonstrate the following:

* The logic needed to balance multiple viewports.
* How to use the Two-way viewport sync feature.

## Description

When views are synchronized any changes to the properties [ViewState](https://www.itwinjs.org/reference/core-frontend/views/viewstate/) of either viewport will be immediately applied to the other.  This is done by calling `connect` on [TwoWayViewportSync](https://www.itwinjs.org/reference/core-frontend/views/twowayviewportsync). One intended use of this feature is for comparing different changesets of the same IModel. Using it that way has the potential for showing the changes over time.
Note: At the time this sample was written [TwoWayViewportSync](https://www.itwinjs.org/reference/core-frontend/views/twowayviewportsync) was in beta.
