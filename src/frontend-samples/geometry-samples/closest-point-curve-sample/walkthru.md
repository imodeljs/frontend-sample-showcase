# Creating Curves

This sample provides several different curves that are used to visualize the closest point on curve function. 

Two of the curves are rounded, the Rounded Rectangle and Rounded Line String, both of which are created from the `CurveFactory` class. The regular Line String is created using the `LineString3d` class. Both the Arc and the Elliptical Arc are created with the `Arc3d` class.

[_metadata_:annotation]:- "CURVEFACTORY"

# Interactive Point Marker

This sample makes use of `Markers` that are able to interacted with by dragging them around, which causes the contents of the sample to update depending on their position. To accomplish this, an extension of the Marker class is created. The InteractivePointMarker runs a tool whenever a marker is clicked on, which processes the movement of the Marker.

[_metadata_:annotation]:- "INTERACTIVEPOINTMARKER"

# Updating Point Markers

The MovePointTool is a custom tool that is run whenever an InteractivePointMarker is clicked on. This tool updates the Marker to track the position of the cursor. The tool does this by executing a callback function every time the cursor moves, which allows for the sample to update depending on the new marker position.


[_metadata_:annotation]:- "UPDATINGPOINT"

# Initializing Point Markers

This sample uses two InteractivePointMarkers. Since the user is only intended to interact with the space point that lies off the curve, we only give that Marker a callback function to update the visualization.

[_metadata_:annotation]:- "SETUPPOINTS"

# Getting Closest Point on Curve

The `CurvePrimitive` class has the function closestPoint, which can be passed a `Point3d` as a parameter, and will return information about the point on the curve that is closest to the space point. In this case, the only information needed for the sample is the actual closest point, which we return for our visualization.

[_metadata_:annotation]:- "CLOSESTPOINTONCURVE"

# Updating Visualization

Once we have our curve, space point, and the closest point on the curve, we are able to visualize these elements. This can be done by adding the curve and both of the point markers to the `GeometryDecorator`, which renders them as World Decorations. In addition, a line is created between the two point markers, which is also added to the decorator.

[_metadata_:annotation]:- "UPDATEVISUALIZATION"
