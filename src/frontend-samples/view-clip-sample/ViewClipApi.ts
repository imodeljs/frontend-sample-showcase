/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { EditManipulator, IModelApp, IModelConnection, ScreenViewport, ViewClipDecorationProvider, ViewClipTool } from "@bentley/imodeljs-frontend";
import { ClipMaskXYZRangePlanes, ClipShape, ClipVector, ConvexClipPlaneSet, Point3d, Range3d, Vector3d } from "@bentley/geometry-core";

export default class ViewClipApi {

  /* Method for clearing all clips in the viewport */
  public static clearClips(vp: ScreenViewport) {
    // Run the ViewClipClearTool and clear the decorators
    ViewClipTool.doClipClear(vp);
    ViewClipDecorationProvider.clear();
  }

  /* Method for adding decorators to the viewport */
  public static addDecorators(vp: ScreenViewport) {
    // Create a clip decorator. Selecting the clip decoration to immediately show the handles is the default.
    const vcdp: ViewClipDecorationProvider = ViewClipDecorationProvider.create();
    // Default behavior is to hide the decorators on deselect. We want to keep the decorators showing in this example.
    vcdp.clearDecorationOnDeselect = false;
    vcdp.showDecoration(vp);
    // The decorators require the SelectTool being active.
    IModelApp.toolAdmin.startDefaultTool();
  }

  /* Method for adding a new clip range around the model's extents */
  public static addExtentsClipRange = (vp: ScreenViewport) => {
    // Get the range of the model contents.
    const range: Range3d = vp.view.computeFitRange();
    // Remove the top half of the z-range so we have something clipped by default
    range.high.z = (range.high.z + range.low.z) / 2.0;
    // Create a block for the ClipVector.
    const block: ClipShape = ClipShape.createBlock(range, range.isAlmostZeroZ ? ClipMaskXYZRangePlanes.XAndY : ClipMaskXYZRangePlanes.All, false, false);
    // Create the ClipVector
    const clip: ClipVector = ClipVector.createEmpty();
    // Add the block to the ClipVector and set it in the ScreenViewport.
    clip.appendReference(block);
    // Call enableClipVolume to ensure all clip flags are properly set
    ViewClipTool.enableClipVolume(vp);
    ViewClipTool.setViewClip(vp, clip);
    ViewClipApi.addDecorators(vp);
  };

  /* Method for setting a plane as the view clip */
  public static setClipPlane(vp: ScreenViewport, clipPlane: string, imodel: IModelConnection) {
    let rotationType: EditManipulator.RotationType;
    switch (clipPlane) {
      default:
      case "0": rotationType = EditManipulator.RotationType.Top; break;
      case "1": rotationType = EditManipulator.RotationType.Front; break;
      case "2": rotationType = EditManipulator.RotationType.Left; break;
      case "None": return true;
    }

    // Get the center point of the displayed extents as a starting point for the clip plane
    const point: Point3d = imodel.displayedExtents.center;
    const normal: Vector3d | undefined = ViewClipTool.getPlaneInwardNormal(rotationType, vp);
    if (normal) {
      ViewClipTool.doClipToPlane(vp, point, normal, true);
      this.addDecorators(vp);
      return true;
    }
    return false;
  }

  public static setViewClipFromClipPlaneSet(vp: ScreenViewport, planeSet: ConvexClipPlaneSet) {
    ViewClipTool.doClipToConvexClipPlaneSet(vp, planeSet);
    this.addDecorators(vp);
    return true;
  }
}
