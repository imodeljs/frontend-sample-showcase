# Emphasize Elements Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to use the EmphasizeElements API.  The API allows for elements to be hidden, emphasized, and colorized.

## Purpose

The purpose of this sample is to demonstrate the following:

- Emphasize - call attention to specific elements while fading the rest to the background.
- Hide - prevent display of specific elements.
- Isolate - display only specific elements while hiding the rest.
- Override - change the color of specific elements.

## Description

The EmphasizeElements class is a wrapper that provides an easy-to-call interface to allow common element appearance overrides.  The four treatments (Emphasize, Hide, Isolate, and Override) cover the most common requirements while lower level APIs allow for more direct control.

This sample works in concert with the SelectElement tool to allow the user to apply each of the four treatments to elements of the user's choosing.  Simply select one or more elements and click one of the four apply buttons.  This triggers a call to one of the following methods:
  EmphasizeElements.emphasizeSelectedElements
  EmphasizeElements.hideSelectedElements
  EmphasizeElements.isolateSelectedElements
  EmphasizeElements.overrideSelectedElements

There is more info about interacting with reality models in the [reality model sample](../reality-data-sample/readme.md).
