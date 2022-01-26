# Serialize View Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to Serialize a view state into JSON and reload the view.

## Purpose

The main purpose is to demonstrate how to serialize a viewstate and reload that viewstate at a later time. This is accomplished by:

- Utilizing a call to toProps of the ViewState object, serializes the ViewState into properties.
- Recreating the ViewState by a call to [ViewState.createFromProps](https://www.itwinjs.org/reference/core-frontend/views/viewstate/createfrompropsstatic/).
- Reloading the ViewState by calling [ViewPort.changeView](https://www.itwinjs.org/reference/core-frontend/views/viewport/changeview/?term=changeview).

## Description

Being able save and reload a view of an IModel is a fundamental feature. This sample shows the two functions required to save a view's properties to json format and reload them.

The "Save State" button will allow the user to save the current view to json format. Then to reload the view, use the "Select View" drop down to select the desired view and press the "Load State" button. This will transition the view to the saved view state.

Use the "Show Json" button to show the json of the saved view in a popup window and the "Save View" to save the view. Then use "Load View" with the view selected to reload with its new settings.

The default views for each iModel are located in [SampleViewStates.ts](./SampleViewStates.ts) and are editable but will require recompiling.
