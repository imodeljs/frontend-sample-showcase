# Issues Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Issues APIs](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/) to retrieve issue data and present in a viewer app. 

## Purpose
- Showcase Issues REST API.
- GET all Issues associated with a project.
- Apply the view of an Issue.
- Create marker pins for each Issue.

## Description
The Issues REST API contains the ability to attach Issues to each project or context. 

The goal of this sample is to demontrate a select few endpoints. An [auto generated client](./IssuesClient.ts) was created using [Acacode's swagger-typescript-api](https://github.com/acacode/swagger-typescript-api) via the OpenAPI definition that is downloadable from the issues website. This file helps showcase's all of the endpoints available as well as the models.

This sample utilizes the [@itwinui-react](https://itwin.github.io/iTwinUI-react/?path=/story/overview--overview) package to demonstrate components.

Each issue contains a color that is attached to it. The color defines the current status the issue is in, with 'Review' beying yellow, 'Open' being red, and 'Draft' being orange.