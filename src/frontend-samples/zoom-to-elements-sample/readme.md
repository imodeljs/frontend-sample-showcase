# Zoom To Elements Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to use the [Viewport.ZoomToElements](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/viewport/zoomtoelements/) API.  The API changes the camera so it is pointing at a specified set of elements.

## Purpose

The purpose of this sample is to demonstrate the following:

- Calling Viewport.ZoomToElement so the user can see a specified set of elements.
- Some of the available options such as: Animate, Margin, and View orientation.

## Descriptions

The Viewport.ZoomToElement is a commonly used API which directs the user's attention to a particular element or group of elements.  The method accepts options from the union of two options structures.  Those are [ZoomToOptions](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/zoomtooptions/) and [ViewChangeOptions](https://www.itwinjs.org/v2/reference/imodeljs-frontend/views/viewchangeoptions).  See the documentation for the full list of options.

This sample allows the user to select one or more elements and add their ids to a simple list.  The list of ids is implemented as an array of strings because that is the form expected by the Viewport.ZoomToElement method.  The list is displayed in the UI by a simple [HTMLSelectElement](https://developer.mozilla.org/en-US/docs/Web/API/HTMLSelectElement).

