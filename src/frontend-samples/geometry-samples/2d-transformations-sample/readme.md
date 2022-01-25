# 2d Transformations Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how create and transform 2d shapes.

## Purpose

The purpose of this sample is to demonstrate the following:

* Create closed 2d shapes.
* Apply transforms such as translations and rotations to geometry.

## Description

This sample demonstrates how to create 2d shapes using [LineString3d](https://www.itwinjs.org/v2/reference/geometry-core/curve/linestring3d/), [Arc3d](https://www.itwinjs.org/v2/reference/geometry-core/curve/arc3d/).  Transformations are applied using the methods [CurveCollection.TryTransformInPlace](https://www.itwinjs.org/v2/reference/geometry-core/curve/curvecollection/#trytransforminplace) and [GeometryQuery.TryTranslateInPlace](https://www.itwinjs.org/v2/reference/geometry-core/curve/geometryquery/#trytranslateinplace).

This geometry sample, like the others, uses a [BlankConnection](https://www.itwinjs.org/v2/learning/frontend/blankconnection/) to create a viewport without connecting to an iModel.  It displays geometry in the viewport using [view decorations](https://www.itwinjs.org/v2/learning/frontend/viewdecorations/).
