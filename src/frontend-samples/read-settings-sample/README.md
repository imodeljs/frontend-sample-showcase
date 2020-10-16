# Read Settings Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

## Purpose

The purpose of this sample is to demonstrate the following:

* Read custom user settings associated with iModel
* Write settings. (note: you can use the code in your project, but it deliberately doesn't work this read-only showcase environment)

## Description

Any settings or data can be stored in Bentley Product Settings Service, designed to work in iModel context. You need to provide `projectId` and `iModelId` when using Product Settings Service client, which is a part of `imodeljs-frontend` library. Settings are accessed by `name`, which serves as identifier, and value is a `string` type. It can be arbitrary text, serialized json object etc.

