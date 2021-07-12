# Issues

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [Issues APIs](https://developer.bentley.com/api-groups/project-delivery/apis/issues-v1/) to retrieve issue data and present in a viewer app. 

## Purpose
- Showcase Issues REST API.
- GET all Issues associated with a project.
- Apply the view of an Issue.
- Create marker pins for each Issue.
- Get list of elements linked to an issue, and zoom to location

## Description
The Issues REST API contains the ability to attach Issues to each project or context. 

The goal of this sample is to demonstrate a select few endpoints. The primary 'GET' endpoints are included in the [client](./IssuesClient.ts) as well as the models returned for these endpoints.

This sample utilizes the [@itwinui-react](https://itwin.github.io/iTwinUI-react/?path=/story/overview--overview) package to demonstrate components.

Each issue's color indicates the status.

- Unresolved = Orange

- Resolved = Green

- Verified = Blue

- Rejected = Red

