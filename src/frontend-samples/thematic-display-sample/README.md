# Thematic Display Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to thematically style the colors of geometry based on the z-coordinate.

## Purpose

The purpose of this sample is to demonstrate the following:

* Turn on Thematic Display in a Viewport.
* Adjust basic settings on the Thematic Display.

## Description

First, toggle the `thematicDisplay` view flag in the viewport.  Setting view flags must be done with a [`ViewFlags`](https://www.imodeljs.org/reference/imodeljs-common/displaystyles/viewflags/) object, and not by toggling particular flags.
Next, any properties of the thematic display can be set using the [`thematic`](https://www.imodeljs.org/reference/imodeljs-common/displaystyles/displaystyle3dsettings/thematic/) property of the [`DisplayStyle3dSettings`](https://www.imodeljs.org/reference/imodeljs-common/displaystyles/displaystyle3dsettings/).  You can create a [`ThematicDisplay`](https://www.imodeljs.org/reference/imodeljs-common/symbology/thematicdisplay/) by calling `ThematicDisplay.fromJSON`.

Thematic Display can also be set using the [Display Settings Styles](../display-styles-sample/README.md).
