# Changed Elements Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Changed Elements APIs](https://developer.bentley.com/api-groups/project-delivery/apis/changed-elements/operations/get-comparison/) to request and visualize the changes made between named versions.

## Purpose

- Demonstrate requesting Named Versions and their changeset Ids.
- Provide [code examples](./ChangedElementsClient.ts) for calling the Version Compare APIs.
- Colorize elements based on last changes made to it.

## Description

The Changeset Ids are needed as arguments to request the Changed Elements.  We get an iModel's Named Versions by requesting them using a [Named Versions API](https://developer.bentley.com/api-groups/data-management/apis/imodels/operations/get-imodel-named-versions/) call.  This response does contain the Changeset Id, but it is contained in the href to the Changeset API and must be parsed out.

While the API allows to compare any two named versions, this sample allows only comparisons against the latest version of the iModel.

The Changed Elements API returns a list of changed elements and the type of operations that updated them.  This information is passed to a [FeatureOverrideProvider](https://www.itwinjs.org/reference/imodeljs-frontend/views/featureoverrideprovider/) that colorizes the elements based on the operations.  For another example using feature overrides, see the [Emphasize Elements](../emphasize-elements-sample/readme.md) sample.

NOTE: There are prerequisites to use the Version Compare APIs.  The users requires a particular role, tThe client scope must include 'changedelements:read' and 'iModels:read', and Element Change tacking must be enabled on the iModel.  Please see the [API documentation site](https://developer.bentley.com/api-groups/project-delivery/apis/changed-elements/operations/get-comparison/) for more details on the prerequisites and usage.
