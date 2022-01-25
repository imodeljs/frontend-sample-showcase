# Transformations Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to use the Transformations API by displaying the changes in two viewports. The result of the transformation is being displayed side by side to the original.

## Purpose

The purpose of this sample is to demonstrate the following:

* The usage and result of the Transformations API
* The logic needed to balance multiple viewports.
* How to use the Two-way viewport sync feature.

## Description

There are three steps to create the transformed iModel based on a [View Definition](https://www.itwinjs.org/reference/imodeljs-backend/viewdefinitions/viewdefinition/). The first step is to create a transformation configuration, in this example a [FilterByViewDefinition](https://developer.bentley.com/apis/transformations/operations/filterbyviewdefinition/), which creates an association between source and target iModels with additional metadata to carry out the transformation. It does NOT start the transformation. 

The second API, [Create Transformation](https://developer.bentley.com/apis/transformations/operations/create-transformation/) actually starts the transformation process by sending in the configuration id.

The third API, [Get Transformation](https://developer.bentley.com/apis/transformations/operations/get-transformation/), gets an updated transformation status as the transformation is occurring

Once the Transformed iModel is created, we can display them side by side using a custom [TwoWayViewportSync.ts](./TwoWayViewportSync.ts). iModelJs currently has a [TwoWayViewportSync](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/twowayviewportsync), however, there is no correlation between the Ids of categories and models between the two iModels. Therefore, this solution wouldn't work and a custom sync is created to just map the camera's state between the two iModels.
