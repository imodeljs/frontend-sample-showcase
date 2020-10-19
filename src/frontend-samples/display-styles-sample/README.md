# Display Styles Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to customize the appearance of a 3d viewport using Display Styles

## Purpose

The purpose of this sample is to demonstrate the following:

* Read from pre-built styles and apply them to the viewport.
* A resource to create custom styles.

## Description

To set a display style, call `viewport.overrideDisplayStyle` and hand it the [DisplayStyleSettingsProps](https://www.imodeljs.org/reference/imodeljs-common/displaystyles/displaystylesettingsprops/).  In this sample, [`DisplayStyle3DSettingsProps](https://www.imodeljs.org/reference/imodeljs-common/displaystyles/displaystyle3dsettingsprops/) are used to provided more options.  It is also suggested to save and load the styles in json format.

Only the features specified by the style will be changed. This can be seen with the "Custom" style you can create. Use the "Merge with Custom" toggle to apply both the custom style and the specified style.

We invite you to create your own settings using the "Custom" tag provided in [Styles.ts](./Styles.ts).  You can copy and paste parts of your favorite styles as a start.
