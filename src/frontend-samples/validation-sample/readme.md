# Validation Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Validation APIs](https://developer.bentley.com/api-groups/project-delivery/apis/validation/operations/get-validation-run/) to retrieve validation rules and the elements that violate them and present it for review in a viewer app. 

## Purpose

- Plot the location of elements that violate validation rules using marker pins.
- Populate table of violations with violating element and rule information.
- Visualize elements in violation by emphasizing them and coloring them red.
- Zoom to violating element on marker click or table selection.
- Provide [code examples](./ValidationClient.ts) for calling the Validation APIs.

## Description

Validation rules are a feature in iTwin Platform that allows for the creation of criteria that must be met by the elements of an iModel, and analyzes and reports elements that are in violation of those criteria. An API now provides direct access to this functionality to enable 3rd-party app integration.

The goal of this sample is to provide example functions for all of the available Validation APIs. [Validation rule data](./ValidationRuleJson.ts) and [violation data](./ValidationResultJson.xts) are also provided to show the format of the data returned from the API.

The following [iTwin.js library](https://www.itwinjs.org/reference/) components are demonstrated:

- [Decorator](https://www.itwinjs.org/reference/imodeljs-frontend/views/decorator/): show the violation marker pins in a viewport.
- [MarkerSet](https://www.itwinjs.org/reference/imodeljs-frontend/views/markerset/): manage a collection of violation marker pins.
- [Marker](https://www.itwinjs.org/reference/imodeljs-frontend/views/marker/): draw violation marker pins at the location of violating elements.
- [Cluster](https://www.itwinjs.org/reference/imodeljs-frontend/views/cluster/): draw cluster pins where a group of violations are located.
- [Table](https://www.itwinjs.org/reference/ui-components/table/): display a table of validation results.
