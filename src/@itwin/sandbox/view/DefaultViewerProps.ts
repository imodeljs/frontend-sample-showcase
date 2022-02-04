/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ItwinViewerUi } from "@itwin/web-viewer-react";

export const default3DSandboxUi: ItwinViewerUi = {
  contentManipulationTools: {
    cornerItem: {
      hideDefault: true,
    },
    hideDefaultHorizontalItems: false,
    hideDefaultVerticalItems: false,
    verticalItems: {
      sectionTools: false,
      measureTools: false,
      selectTool: false,
    },
    horizontalItems: {
      clearSelection: false,
      clearHideIsolateEmphasizeElements: false,
      isolateElements: false,
      hideElements: false,
      emphasizeElements: false,
    },
  },
  navigationTools: {
    hideDefaultHorizontalItems: false,
    hideDefaultVerticalItems: false,
    verticalItems: {
      walkView: true,
      cameraView: true,
    },
    horizontalItems: {
      rotateView: true,
      panView: true,
      fitView: true,
      windowArea: true,
      undoView: true,
      redoView: true,
    },
  },
  hideDefaultStatusBar: true,
  hidePropertyGrid: true,
  hideToolSettings: true,
  hideTreeView: true,
};

export const default3DAppUi: ItwinViewerUi = {
  contentManipulationTools: {
    cornerItem: {
      hideDefault: true,
    },
    hideDefaultHorizontalItems: false,
    hideDefaultVerticalItems: false,
    verticalItems: {
      sectionTools: true,
      measureTools: true,
      selectTool: true,
    },
    horizontalItems: {
      clearSelection: true,
      clearHideIsolateEmphasizeElements: true,
      isolateElements: true,
      hideElements: true,
      emphasizeElements: true,
    },
  },
  navigationTools: {
    hideDefaultHorizontalItems: false,
    hideDefaultVerticalItems: false,
    verticalItems: {
      walkView: true,
      cameraView: true,
    },
    horizontalItems: {
      rotateView: true,
      panView: true,
      fitView: true,
      windowArea: true,
      undoView: true,
      redoView: true,
    },
  },
  hideDefaultStatusBar: false,
  hidePropertyGrid: true,
  hideToolSettings: true,
  hideTreeView: true,
};

export const default2DSandboxUi: ItwinViewerUi = {
  contentManipulationTools: {
    cornerItem: {
      hideDefault: true,
    },
    hideDefaultHorizontalItems: false,
    hideDefaultVerticalItems: false,
    verticalItems: {
      sectionTools: false,
      measureTools: false,
      selectTool: false,
    },
    horizontalItems: {
      clearSelection: false,
      clearHideIsolateEmphasizeElements: false,
      isolateElements: false,
      hideElements: false,
      emphasizeElements: false,
    },
  },
  navigationTools: {
    hideDefaultHorizontalItems: false,
    hideDefaultVerticalItems: false,
    verticalItems: {
      walkView: false,
      cameraView: false,
    },
    horizontalItems: {
      rotateView: false,
      panView: true,
      fitView: true,
      windowArea: true,
      undoView: true,
      redoView: true,
    },
  },
  hideDefaultStatusBar: true,
  hidePropertyGrid: true,
  hideToolSettings: true,
  hideTreeView: true,
};
