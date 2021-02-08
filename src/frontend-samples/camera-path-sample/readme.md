# Camera Path Sample

Copyright © Bentley Systems, Incorporated. All rights reserved.

This sample demonstrates animation using the viewport camera APIs which is can be used to navigate to different parts of an iModel.

## Purpose

The purpose of this sample is to demonstrate the following

* Animate the camera using predefined coordinates of location and direction in different paths.

* Implementing a PrimitiveTool to change the direction of the camera.

## Description

This sample demonstrates camera animation in three different paths using the [lookAtUsingLensAngle](https://www.itwinjs.org/reference/imodeljs-frontend/views/viewstate3d/lookatusinglensangle/) and [setEyePoint](https://www.itwinjs.org/reference/imodeljs-common/rendering/camera/#seteyepoint) APIs of viewport camera.  It also demonstrates installing a primitive tool and handling the mouse events through it.  The Play/Pause button will play, pause, and resume the camera animation.  The timeline slider indicates the progress of the path traversal.  The animation speed can be varied. The view direction of the camera can be changed by clicking in the view and doing mouse motion.
