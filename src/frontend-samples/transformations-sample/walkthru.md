# Connecting to Transformed iModel
The purpose of this sample is to demonstrate the Transformation API, however, the sample-showcase is readonly and is unable to create a transformation for the user. Therefore a FilterByViewDefintion Transformation has already been done to the Stadium iModel.

The two lines of code shown is how the sample showcase is used to connect to the Transformed Stadium. GetIModelInfo() grabs the contextId and iModelId for the Transformed Stadium, and then we open a remote connection to connect to.

For more information on the three API's used to accomplish this feat, see:

https://sbx-developer.bentley.com/api-groups/synchronization/apis/transformations/operations/filterbyviewdefinition/

https://sbx-developer.bentley.com/api-groups/synchronization/apis/transformations/operations/create-transformation/

https://sbx-developer.bentley.com/api-groups/synchronization/apis/transformations/operations/get-transformation/

[_metadata_:annotation]:- "TRANSFORMED_IMODEL_CONNECTION"

# Comparison of iModels: Creating a Frontstage

Similar to the Multiviewport widget, we create a horizontal split between top and bottom. Then the content of the split is created. A viewstate for each connection MUST be supplied otherwise the second connection will be overriden by the first, regardless if it is passed in or not. 

The iTwin viewer is only capable of managing a single iModel connection at a time. However, you can have multiple Viewports in the same app each looking at a different IModelConnection.

[_metadata_:annotation]:- "FRONTSTAGE"

# Syncing Viewports Together

A useEffect hook is used to sync the two `viewPorts` together upon initalization. The call to `connectViewports()` is the function that creates the sync, and `disconnectViewports()` removes the connection.

The order the viewports are passed in determines which camera's position is overridden - the second `viewport's` camera position takes the position of the first's. 

[_metadata_:annotation]:- "SYNC"

# Connection

In order for camera positions to be manipulated, the camera for both viewports must be turned on. A call to `turnCameraOn()` ensures this. Then a call to `changeCameraPositionAndTarget()` is called to change the position viewport2's camera to match the first.

Finally, two listeners are added to both views when either change, it reflects in the other.

[_metadata_:annotation]:- "CONNECT"

# Changing the Camera Position

At this point in the method call, changeCameraPositionAndTarget assumes that the viewport is a 3D viewstate and is cast as such. The `ViewState3d` class has the method `lookAtUsingLensAngle` which takes a ton of positional information. This information is retrieved from the first viewState and passed in as arguements. Then, in order to redraw the viewport, a call to `invalidateRenderPlan()` is done and finally `synchWithView`.

Now the two viewports will mirror each other.

[_metadata_:annotation]:- "CAMERA_POSITION"
