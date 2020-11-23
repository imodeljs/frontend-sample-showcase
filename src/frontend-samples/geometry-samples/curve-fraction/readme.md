# Curve Fraction To Point Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates the relationship between fractions and points on a curve primitive.

## Purpose

The purpose of this sample is to demonstrate the following:

* Create various curve primitives including line segment, arc, and line string.
* Starting with a fraction value between 0 and 1, compute both a point and a derivative along each curve using [CurvePrimitive.fractionToPointAndDerivative](https://www.itwinjs.org/reference/geometry-core/curve/curveprimitive/fractiontopointandderivative/).
* Starting with a mouse point, compute the fraction value of the closest point on the curve using [CurvePrimitive.closestPoint](https://www.itwinjs.org/reference/geometry-core/curve/curveprimitive/closestpoint/)

## Description

This sample creates various curve primitives and then shows how to compute point and derivative information along each curve.  For a given fraction value between 0 and 1, the sample draws both a) a green circle representing the point and b) a green arrow representing the derivative at that point.  The length of the arrow is proportional to the magnitude of the derivative.

This geometry sample, like the others, uses a [BlankConnection](https://www.imodeljs.org/learning/frontend/blankconnection/) to create a viewport without connecting to an iModel.  It displays geometry in the viewport using [view decorations](https://www.imodeljs.org/learning/frontend/viewdecorations/).
