# 3D Primitives

This sample demonstrates how to create common types of three-dimensional `geometry`. Several of these are standard geometric primitives that you will be familiar with. Below are descriptions of how each type of these primitives are created:

- [Box](/?step=BOX) \- This uses `Box.createRange`, which has parameters for a `Range3d`, which represents the extents of the box, and a boolean for if the box should be capped.
- [Sphere](/?step=SPHERE) \- This uses `Sphere.createCenterRadius`, which has parameters for a `Point3d` center, and a radius.
- [Cone](/?step=CONE) \- This uses `Cone.createAxisPoints`, which has parameters for two center `Point3d`, two radii, and a boolean for if the cone should be capped.
- [Torus Pipe](/?step=TORUSPIPE) \- This uses `TorusPipe.createAlongArc`, which has parameters for an `Arc3d` for the shape of the torus pipe, a number for the radius, and a boolean for if the torus pipe should be capped.

[_metadata_:annotation]:- "GEOMETRY3D"

# Box
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "BOX"

# Sphere
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "SPHERE"

# Cone
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "CONE"

# Torus Pipe
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "TORUSPIPE"

# Sweeps

`Sweeps` are another type of primitive that can be created. They work by taking in one or more contours, which are then swept to create a unique piece of geometry along the path of the sweep. Below is a description of each of the sweeps and how they are created:

- [Linear Sweep](/?step=LINEARSWEEP) \- A linear sweep of a base contour. Created by `LinearSweep.create`, which takes in parameters of a `CurveCollection` as a contour, a `Vector3d` as a direction, and a boolean for if the sweep should be capped.
- [Rotational Sweep](/?step=ROTATIONALSWEEP) \- A rotational sweep of a base contour. Created by `RotationalSweep.create`, which takes in parameters of a `CurveCollection` as a contour, a `Ray3d` as an axis for the sweep, an `Angle` that is used for the sweep relative to the axis, and a boolean for if the sweep should be capped.
- [Ruled Sweep](/?step=RULEDSWEEP) \- Two or more similarly structured contours joined by linear rule lines. Created by `RuledSweep.create`, which takes in parameters of a `CurveCollection[]` which contains all the desired contours, and a boolean for if the sweep should be capped.


[_metadata_:annotation]:- "SWEEPS"

# Linear Sweep
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "LINEARSWEEP"

# Rotational Sweep
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "ROTATIONALSWEEP"

# Ruled Sweep
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "RULEDSWEEP"


# Mitered Pipes

Unlike the other geometry shown in this sample, `Mitered Pipes` are not a primitive geometry shape. They are only able to be created by calling `PolyfaceBuilder.addMiteredPipes`, which takes a parameter of a `LineString3d` as the path for the pipes to be built along, a radius for the pipes, and optionally the number of facets on the pipes.

[_metadata_:annotation]:- "MITEREDPIPES"


# Polyfaces

One way of rendering 3D Primitives is by converting them into a `Polyface`. To convert the shapes into a polyface, we use a `PolyfaceBuilder`, which supports a variety of 3D primitives and converts them into Polyfaces after calling `PolyfaceBuilder.claimPolyface` after adding your primitives to the builder. Polyfaces are then able to be added to a `GraphicBuilder`, which can then convert the shapes into renderable `World Decorations`.

[_metadata_:annotation]:- "POLYFACES"
