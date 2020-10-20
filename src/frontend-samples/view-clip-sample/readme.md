# Clipping Plane Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how add a clipping range, clipping plane, and range decorators to a view.

## Purpose

The purpose of this sample is to demonstrate the following:

* Clipping range - Clip the 3D model with a range.
* Clipping plane - Clip the 3D model with a plane.
  * Edit an existing clipping plane.
* Decorators - Add decorators and handles to adjust the size of the clipping range.

## Description

This sample demonstrates how to add a `ClipVector` around the displayed extents of the model. The first step is to get `displayedExtents` from the `ScreenViewport` and creating a `ClipShape` from that range. Next, the `ClipShape` is added to the `ScreenViewport` by using `viewport.view.setViewClip`. Finally, `ViewClipDecorationProvider` is used to add or hide the decorators and handles. The default behavior of hiding decorators on selection is overridden.

A clipping plane can also be addded on the X, Y, or Z axis in the middle of the model. The sample also demonstrates how to edit an existing clip plane, in this case negating or "flipping" the clip.
