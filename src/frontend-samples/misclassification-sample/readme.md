# Misclassification Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling [iTwin Classification Validation APIs](https://developer.bentley.com/apis/classification-validation/) to retrieve misclassified element data and present it for review in a viewer app.

## Purpose

- Use a DataProvider to populate a table of misclassification results.
- Visualize a misclassified element with a red highlight.
- Zoom to a misclassified element on table row selection.
- Provide a [code example](./MisclassificationClient.ts) for calling a Classification Validation API.

## Description

A classification validation test is used to analyze potential element misclassifications using a machine learning model pipeline. Using a pre-registered ML model, a test can be created and triggered through Classification Validation APIs. The misclassified elements of the test can then be retrieved for review.

The goal of this sample is to provide some examples of calling Classification Validation APIs. [Misclassification sample data](./MisclassificationJson.ts) is also provided to show the format of the data returned from the API.

NOTE: The data used within this demo is not and should not be used as an accurate example of misclassified elements in an iModel.
