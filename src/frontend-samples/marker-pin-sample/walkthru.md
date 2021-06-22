# Welcome

This panel will give you a guided tour of the Marker Pins code sample.  Please use the &#x02192; button below to start the tour.  Or you can browse through and jump directly to any step using the control above.  During the tour, the &#x025ef;  button will recenter the code editor.

[_metadata_:annotation]:- "SETUPDECORATOR"

# Setup

This sample implements a [View Decorator](https://www.itwinjs.org/learning/frontend/viewdecorations/) to draw [Markers](https://www.itwinjs.org/learning/frontend/markers/) which are used to call the user's attention to a particular point in space.

The `setupDecorator` is called as the sample is initializing.  It is provided an array of MarkerData //WANT A LINK// which supplies the location and title for each marker.  The method initializes the decorator object with the supplied marker data.

[_metadata_:annotation]:- "SETUPDECORATOR"

# Add Decorator

Once our Decorator is ready we need to register it with the ViewManager.  After being registered, the viewManager will call our decorator when it needs to draw decorations.

[_metadata_:annotation]:- "ENABLEDECORATIONS"

# Marker Pin Decorator

`MarkerPinDecorator` is our custom implementation of `Decorator`.  It does the important work of the sample which is to create the `Markers` which will be displayed.  For the sample, we keep track of two `MarkerSet`s.  Each `MarkerSet` has an array of `Marker` objects.  The sample creates the `_autoMarkerSet` immediately.  By default it contains a cloud of markers at random locations.  The `_manualMarkerSet` is used to hold an array of markers created manually by the user.

[_metadata_:annotation]:- "MARKERPINDECORATOR"

# Decorate

This is our implementation of `Decorator.decorate`.  It is called by the display system for every render frame.  It's responsibility is to add graphics to the `DecorateContext` which will cause those graphics to be displayed.  In this code sample, we are calling a default implementation of `MarkerSet.addDecoration`.  That method calls each marker in turn to add it's own graphics.

Also, `MarkerSet.addDecoration` decides which markers to 'cluster', asks us to create a cluster object as needed, and then asks the cluster objects to add their graphics.  To see clustering in action, zoom out so that several markers would appear close together.

[_metadata_:annotation]:- "DECORATE"

# Marker Set

This is our implementation of `MarkerSet`.  For the most part we don't need to override its default behavior.

We do need to implement `MarkerSet.getClusterMarker` which will be called whenever multiple markers would be drawn within the pixel tolerance specified by `MarkerSet.minimumClusterSize`.  When that happens, we create a `Cluster` object that handles creating graphics for the cluster.

Also, our custom `SampleMarkerSet` implements its own helper methods to manage its internal marker array.

- setMarkerData - Add a set of markers  // WANT LINK to SETMARKERSDATA
- removeMarker - remove a single marker // WANT LINK to REMOVEMARKER

[_metadata_:annotation]:- "SAMPLEMARKERSET"

# Cluster Marker

The class `SampleClusterMarker` extends the `Marker` base class.  It's job is to display a marker representing a cluster of regular markers.

To do this the class overrides the following methods:

- `constructor` - initializes the basic properties such as location, size, and label. // LINK TO CLUSTERMARKERCONSTRUCTOR  Also, the constructor constructs a tooltip string by concatenating the tooltips from the markers in the cluster // LINK TO CLUSTERMARKERTOOLTIP
- `onMouseButton` - forwards the mouse button event to the callback.  // LINK TO CLUSTERMARKERMOUSEBUTTON
- `drawFunc` - draws a simple white circle centered on the origin of the marker's local coordinate system.  // LINK TO CLUSTERMARKERDRAWFUNC

# Marker

The class `SamplePinMarker` also extends the `Marker` base class.  It is similar to the `SampleClusterMarker` with these differences:

- image - this marker uses setImage rather than overriding `drawFunc` like the cluster marker does.  // LINK TO MARKERPINIMAGE
- pick - override `pick` to account for the image offset // LINK TO MARKERPINPICK

