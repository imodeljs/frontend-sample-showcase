# Cross Probing Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This samples demonstrate how to implement basic cross-probing between 2D and 3D elements given an iModel of a Plant. Follow this [blog post](https://medium.com/imodeljs/hablas-bis-90e6f99c8ac2) for more information.

## Purpose

The purpose of this sample is to demonstrate the following:

* Present 3D and 2D models side-by-side in two Viewports.
* Query iModel to obtain a list of connections between 2D and 3D elements (More details in blog post above).
* Allow user to click on a 2D element and zoom into corresponding 3D element, and vice versa.

## Description

The idea of cross-probing has been a hot topic ever since the advent of iModel.js. The goal is to present 3D and 2D models side-by-side and allow users to navigate between the two by clicking on elements in either viewport. Any time a 3D element is clicked, if its 2D representation exists, open the 2D model that contains it and zoom into that 2D element. Similarly, any time a 2D element is clicked, if a corresponding 3D element exists, zoom into it. In order to accomplish this, we first query for all the connections between the 2D and 3D elements in the iModel. This query would vary depending on the schema of the iModel in question. In this sample, we use the example of a plant schema to demonstrate the basic concept.
