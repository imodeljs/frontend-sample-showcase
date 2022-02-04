# Changed Elements Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Changed Elements APIs](https://developer.bentley.com/api-groups/project-delivery/apis/changed-elements/operations/get-comparison/) to request and visualize the changes made between named versions.

## Purpose

- Demonstrate requesting Named Versions and their changeset Ids.
- Provide [code examples](./ChangedElementsClient.ts) for calling the Changed Element API.
- Colorize elements based on the last operations made to it.

## Description

The first step is to get the Named Versions and associated changeset ids for the iModel.  The changeset ids are needed as arguments to request the changed elements.

The Changed Elements API returns an object of [ChangedElements](https://www.itwinjs.org/reference/core-common/entities/changedelements/) type, with elements ids and the type of operations that updated them.  This information is passed to a [FeatureOverrideProvider](https://www.itwinjs.org/reference/core-frontend/views/featureoverrideprovider/) that colorizes the elements based on the operations.

While the API allows the comparison of any two Named Versions, this sample allows only comparisons against the latest version of the iModel.

NOTE: There are prerequisites to use the Changed Elements APIs.  The user requires a particular role in the project, the client scope must include 'changedelements:read' and 'iModels:read', and Element Change tacking must be enabled on the iModel.  Please see the [API documentation site](https://developer.bentley.com/api-groups/project-delivery/apis/changed-elements/operations/get-comparison/) for more details on the prerequisites and usage.
