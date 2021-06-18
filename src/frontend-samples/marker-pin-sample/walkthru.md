# Welcome

This panel will give you a guided tour of the Marker Pins code sample.  Please use the 'next' button below to start the tour.  Or you can browse through and jump directly to any step using the control above.

[_metadata_:annotation]:- "SETUPDECORATOR"

# Setup

This sample implements a [View Decorator](https://www.itwinjs.org/learning/frontend/viewdecorations/) to draw [Markers](https://www.itwinjs.org/learning/frontend/markers/) which are used to call the user's attention to a particular point in space.

The `setupDecorator` is called as the sample is initializing.  It is provided an
array of MarkerData //WANT A LINK// which supplies the location and title for each marker.  The method initializes the decorator object with the supplied marker data.

[_metadata_:annotation]:- "SETUPDECORATOR"

# Add Decorator

Once our Decorator is ready we need to register it with the ViewManager.  After being registered, the viewManager will call our decorator when it needs to draw decorations.

[_metadata_:annotation]:- "ENABLEDECORATIONS"

# Marker Pin Decorator

The MarkerPinDecorator does the important work of the sample which is creating the Markers which will be displayed.  For the sample, we keep track of two MarkerSets.  Each MarkerSet is has an array of Marker objects.  The sample creates the _autoMarkerSet immediately.  By default it contains a cloud of markers at random locations.

[_metadata_:annotation]:- "MARKERPINDECORATOR"

# Decorate

The decorate method

[_metadata_:annotation]:- "DECORATE"
