# Scientific Visualization Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates animated scientific visualization using [AnalysisStyle] APIs to animate a mesh that has been supplemented with PolyfaceAuxData

## Purpose

Creating a decorator and rendering it in the active view.

Providing dropdown to select mesh type and mesh style

## Description

This sample uses a [BlankConnection](https://www.imodeljs.org/learning/frontend/blankconnection/) to create a viewport without connecting to an iModel.
As part of a DisplayStyleSettings, AnalysisStyle APIs describes how to animate meshes in the view that have been augmented with [PolyfaceAuxData](https://www.itwinjs.org/reference/geometry-core/polyface/polyfaceauxdata/). The style specifies which channels to use, and can deform the meshes by translating vertices and/or recolor vertices using [ThematicDisplay](https://www.itwinjs.org/reference/imodeljs-common/symbology/thematicdisplay/).
