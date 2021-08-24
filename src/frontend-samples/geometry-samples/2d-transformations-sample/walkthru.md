# 2D Geometry

This sample demonstrates how to create a few common types of two-dimensional `geometry`. For each of the types of geometry, a `Loop` is created by using [Loop.create(args)](https://www.itwinjs.org/reference/geometry-core/curve/loop/), which is then passed into the `Geometry Decorator` for rendering. Below are descriptions of how each type of geometry is created:

- [Square](/?step=SQUARE) \- A `LineString3d` is created using `LineString3d.create`, which accepts an array of `Point3d` as a parameter, each one representing a corner of the square. This `LineString3d` can then be passed into which `Loop.create`, which returns a `Loop`.
- [Circle](/?step=CIRCLE) \- An `Arc3d` is created using `Arc3d.createxy`, which takes a point and a radius and returns a circular `Arc3d`. That arc is then passed into `Loop.create`, which returns a `Loop`.
- [Triangle](/?step=TRIANGLE) \- This uses the same process as the square, but the intial `Point3d` array contains only three points.
- [Convex Hull](/?step=CONVEXHULL) \- A call is made to `Point3dArray.computeConvexHullXY`, which takes a parameter of an array of several `Point3d`. This function will populate two arrays, one of which contains all the points from the original array that when combined into a `LineString3d` will produce a convex shape. This array of `Point3d` is then used following the same procedure as the square.

[_metadata_:annotation]:- "GEOMETRYTYPES"

# Square
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "SQUARE"

# Circle
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "CIRCLE"

# Triangle
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "TRIANGLE"

# Convex Hull
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "CONVEXHULL"

# Translation

`Translation` can be performed on a `Loop` by using `Loop.tryTranslateInPlace`. This function takes an x, y, and z translation as parameters, and will shift the provided `Loop` in those directions, if possible.

[_metadata_:annotation]:- "TRANSLATION"


# Rotation

 To perform a `Rotation`, we need to provide a `Transform` that can be created by `Transform.createRowValues`. The values passed into createRowValues will change depending on which axis you wish to rotate around. Once a `Transform` is created, it can be passed into `Loop.tryTransformInPlace`, which will rotate the `Loop` according to the `Transform`, if possible.


[_metadata_:annotation]:- "ROTATION"
