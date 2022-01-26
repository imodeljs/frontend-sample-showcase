# Scientific Visualization Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates how to visualize physical and/or simulation data by adding per-vertex data to a mesh.

## Purpose

Augmenting a mesh with auxiliary properties used to drive the visualization.

Creating an analysis style that applies the visualization to the mesh's graphics.

Using a viewport animator and a timeline scrubber to animate the mesh in a viewport.

## Description

Scientific visualization requires the object(s) to be represented as a [Polyface](https://www.itwinjs.org/reference/core-geometry/polyface/polyface/) augmented with channels of per-vertex properties defined by [PolyfaceAuxData](https://www.itwinjs.org/reference/core-geometry/polyface/polyfaceauxdata/). This sample provides two example meshes:

- A cantilever, with auxiliary channels reflecting the stress induced by bending the object; and
- A non-realistic example based on a square mesh, with channels modeling height, slope, and displacement, to demonstrate the basic concepts and APIs.

For each mesh, the user can select from the channels to produce an [AnalysisStyle](https://www.itwinjs.org/reference/core-common/displaystyles/analysisstyle/) which can produce static and animated visualizations. The visualizations can deform the mesh by applying per-vertex displacements and/or recolor vertices using [ThematicDisplay](https://www.itwinjs.org/reference/core-common/symbology/thematicdisplay/). The per-vertex values are smoothly interpolated over the face of each triangle and - for animated styles - over time.
