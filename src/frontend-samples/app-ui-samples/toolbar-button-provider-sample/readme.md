# Toolbar Button Provider Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to use the [UiItemsProvider](https://www.imodeljs.org/reference/appui-abstract/uiitemsprovider/) API.  This API allows an AppUI interface to be altered when a package or extension is loaded.

## Purpose

The purpose of this sample is to demonstrate the following:

- Defining a UiItemsProvider.
- Using provideToolbarButtonItems() to specify a toolbar button to be added to a tool widget's toolbar.
- Using ToolbarItemUtilities.createActionButton() to create an button with an icon that launches a tool.
- Using UiItemsManager to register a UiItemsProvider. 

## Description

An extension or package that would like to modify an app's UI can do so by defining and registering a UiItemsProvider to provide UI items that will be added to 
the different areas in an AppUi app. For clarity, this sample is specific to adding a button to a toolbar in one of the tool widgets. This gives a package or extension
a seamless integration for its tools into the app's UI.
