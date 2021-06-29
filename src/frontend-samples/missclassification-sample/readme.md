# Misclassifications Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates calling Design Validation APIs to retrieve misclassified element data and present it for review in a viewer app.

## Purpose

- Use a DataProvider to populate table of sample misclassification results.
- Visualize a misclassified element with a red highlight.
- Zoom to a misclassified element on table selection.
- Provide [code examples](./MisclassificationApi.ts) for calling the Misclassification Test APIs.

## Description

A Misclassification test is used to analyze potential element misclassifications using a machine learning model pipeline. Using a pre-registered ML model, a test can be created and triggered through Design Validation. The misclassified elements of the test can be then be downloaded through a sas URI fetched from ML api via Design Validation.

The goal of this sample is to provide an example of the usage of Design Validation APIs to create, run and fetch the results of a new classification test. [Misclassifications sample data](./MisclassificationsJson.ts) is also provided to show the format of the data returned from the API.

NOTE: The data used within this demo is not and should not be used as an accurate example of actual misclassified elements on an iModel.
