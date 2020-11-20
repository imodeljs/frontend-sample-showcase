# Curve Fraction To Point Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates the relationship between fractions and points on a curve path.

## Purpose

The purpose of this sample is to demonstrate the following:

* Create various paths including primitive (line segment, arc, etc.) and curve chains (line strings, etc.).
* Starting with a fraction value between 0 and 1, compute both a point and a derivative along each path using [CurveChainWithDistanceIndex.fractionToPointAndDerivative](https://www.itwinjs.org/reference/geometry-core/curve/curvechainwithdistanceindex/fractiontopointandderivative/).
* Starting with a mouse point, compute the fraction value of the closest point on the curve using [CurveChainWithDistanceIndex.closestPoint](https://www.itwinjs.org/reference/geometry-core/curve/curvechainwithdistanceindex/closestpoint/)

## Description

This sample creates various curve chain paths and then shows how to compute point and derivative information along each path.  For a given fraction value between 0 and 1, the sample draws both a) a green circle representing the point and b) a green arrow representing the derivative at that point.  The length of the arrow is proportional to the magnitude of the derivative.

This geometry sample, like the others, uses a [BlankConnection](https://www.imodeljs.org/learning/frontend/blankconnection/) to create a viewport without connecting to an iModel.  It displays geometry in the viewport using [view decorations](https://www.imodeljs.org/learning/frontend/viewdecorations/).
