# Creating Curves

This sample provides several different curves that are used to visualize getting the fraction of a point on a curve.

The Line Segment Flat Diagonal, Step Line String, and Half Step Line String are created with the `LineString3d` class, while the Arc and Elliptical Arc are created with the `Arc3d` class.

[_metadata_:annotation]:- "CURVEFACTORY"

# Interactive Point Marker

This sample makes use of `Markers` that are able to interacted with by dragging them around, which causes the contents of the sample to update depending on their position. To accomplish this, an extension of the Marker class is created. The InteractivePointMarker runs a tool whenever a marker is clicked on, which processes the movement of the Marker.

[_metadata_:annotation]:- "INTERACTIVEPOINTMARKER"

# Updating Point Markers

The MovePointTool is a custom tool that is run whenever an InteractivePointMarker is clicked on. This tool updates the Marker to track the position of the cursor. The tool does this by executing a callback function every time the cursor moves, which allows for the sample to update depending on the new marker position.

[_metadata_:annotation]:- "UPDATINGPOINT"

# Getting Current Fraction

The `CurvePrimitive` class has the function `closestPoint`, which can be passed a `Point3d` as a parameter, and will return information about the point on the curve that is closest to the parameter point. This information includes the fraction of the curve that the point falls on. By passing in a point that we know falls on the line, we are able to get that point's fraction along the curve.

[_metadata_:annotation]:- "GETFRACTION"

# Updating Fraction Visualization

In order to synchronize each of the curves, whenever the fraction or curveData is updated, we need to iterate through all five of the curves, and update each of their points and derivatives based on the new fraction value.

[_metadata_:annotation]:- "FRACTIONUPDATE"

# Getting Current Point Derivative

The `CurvePrimitive` class has the function `fractionToPointAndDerivative`, which can be passed a fractional number as a parameter, and will return a `Ray3d` which shows the point on the curve that fraction represents, as well as the derivative at that point on the curve, which is used for the visualization of the sample.

[_metadata_:annotation]:- "GETDERIVATIVE"

# Updating Derivative Visualization

Whenever the fraction, curves, or decorator is updated, the visualization needs to be updated as well. For each curve, the curve, the InteractivePointMarker that falls on the current fraction, and the ray that represents the derivative are visualized using the `GeometryDecorator`. The curve and point can be handled directly by the decorator, but for the derivative, an arrow is constructed using LineStrings and Loops based on the ray's direction and position, which is then passed into the decorator.

[_metadata_:annotation]:- "UPDATEVISUALIZATION"
