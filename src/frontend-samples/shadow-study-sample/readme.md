# Shadow Study Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample shows how to enable solar shadows and modify the current solar time on a display style.

## Purpose

The main purpose is to demonstrate how to modify the display style, specifically the following features:

* Utilizing a call to DisplayStyle3d.setSunTime, which modifies the sun time, allowing for the shadows to be set to an arbitrary point in time.
* Working with the viewFlags of a viewState. In this case, we enable the shadow viewFlag to show how modifying the sun time affects the shadows.

## Description

Showing how the shadows of an imodel can change over a span of time is just one application of the many different viewFlags available to iModel.js frontend application. To see many of the other viewFlags that can be modified, the [view attributes sample](../view-attributes-sample/readme.md) takes a much broader look at the different features in a viewState.

Using shadows as part of your imodel frontend also allows for other types of lighting to cast shadows on your imodel, such as camera lighting, which instead of coming from the Sun's location, will come directly from the camera.

In addition, this sample shows how to convert times from easily human readable formats, like strings or a date object, into the UNIX time format, which is a common timekeeping standard for many applications.
