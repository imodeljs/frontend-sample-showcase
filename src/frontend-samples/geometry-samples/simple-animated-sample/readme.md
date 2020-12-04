# Simple Animated Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how animate view decorations using a timer.

## Purpose

The purpose of this sample is to demonstrate the following:

* Create animation by updating view decorations.

## Description

Implementing the famous Conway's Game of Life, this sample shows how to animate a view decoration by calling [ViewManager.invalidateDecorationsAllViews](https://www.imodeljs.org/reference/imodeljs-frontend/views/viewmanager/?term=invalidatedecorationsallviews#invalidatedecorationsallviews) on a timer.

This geometry sample, like the others, uses a [BlankConnection](https://www.imodeljs.org/learning/frontend/blankconnection/) to create a viewport without connecting to an iModel.  It displays geometry in the viewport using [view decorations](https://www.imodeljs.org/learning/frontend/viewdecorations/).
