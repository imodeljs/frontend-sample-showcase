# BlankViewer

Each of the geometry samples makes use of the `BlankViewer` to visualize different types of `geometry`. The `BlankViewer` is different from your traditional `Viewer`, since it does not require an iModel, instead allowing you to use a [BlankConnection](/?step=BLANKCONNECTION). The `BlankConnection` has several of the same properties as an `IModelConnection`, such as location and extents. The `BlankViewer` also uses a [BlankConnectionViewState](/?step=BLANKCONNECTIONVIEWSTATE), which acts similar to a traditional `ViewState`.

[_metadata_:annotation]:- "BLANKVIEWER"

# BlankConnection
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "BLANKCONNECTION"

# BlankConnectionViewState
[_metadata_:minor]:- "true"
[_metadata_:annotation]:- "BLANKCONNECTIONVIEWSTATE"

# Geometry Decorator 

The BlankViewer is used to create the scene without an iModel, but this means that we are unable to work with any elements since there is no iModel to add them to. Instead, this sample visualizes geometry by making use of a `decorator`. The `Geometry Decorator` has several rendering settings, such as line thickness or fill color, and can then be passed geometry that will be rendered with those settings as `World Decorations`.

[_metadata_:annotation]:- "GEOMETRYDECORATOR"

# Line Segment

A `LineSegment3d` is a type of geometry that represents a line segment in three dimensional space. The constructor requires two `Point3d`, one for each endpoint of the line segment.

[_metadata_:annotation]:- "LINESEGMENT"

# Points Along Line

`FractionToPoint` is a method from the `Curve` class, which the `LineSegment3d` class extends. This method accepts a number as a parameter which represents a fractional distance along the line segment. The method returns the `Point3d` that falls at the end of that fraction of the segment. For example, passing in 0.5, would return the midpoint of the line segment. Note that the fraction being passed in does not need to fall in the range of 0 to 1, in which case the point would lie beyond the line segment, but still in proportion to the slope of the line.

[_metadata_:annotation]:- "POINTSALONGLINE"