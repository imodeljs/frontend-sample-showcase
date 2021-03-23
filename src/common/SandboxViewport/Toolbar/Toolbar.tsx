/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { FitViewTool, IModelApp, PanViewTool, RotateViewTool, SelectionTool, ZoomViewTool } from "@bentley/imodeljs-frontend";
import "./Toolbar.scss";

export interface ToolbarProps {
  allowRotate?: boolean;
}

/** Toolbar containing simple navigation tools */
export const Toolbar: FunctionComponent<ToolbarProps> = ({ allowRotate }) => {

  const select = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    IModelApp.tools.run(SelectionTool.toolId);
  };

  const fitView = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView);
  };

  const rotate = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    IModelApp.tools.run(RotateViewTool.toolId, IModelApp.viewManager.selectedView);
  };

  const pan = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    IModelApp.tools.run(PanViewTool.toolId, IModelApp.viewManager.selectedView);
  };

  const zoom = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
    e.preventDefault();
    IModelApp.tools.run(ZoomViewTool.toolId, IModelApp.viewManager.selectedView);
  };

  /* eslint-disable */
  return (
    <div className="toolbar">
      <a href="#" title={SelectionTool.flyover} onClick={select}><span className="icon icon-cursor"></span></a>
      <a href="#" title={FitViewTool.flyover} onClick={fitView}><span className="icon icon-fit-to-view"></span></a>
      {allowRotate && <a href="#" title={RotateViewTool.flyover} onClick={rotate}><span className="icon icon-gyroscope"></span></a>}
      <a href="#" title={PanViewTool.flyover} onClick={pan}><span className="icon icon-hand-2"></span></a>
      <a href="#" title={ZoomViewTool.flyover} onClick={zoom}><span className="icon icon-zoom"></span></a>
    </div>
  );
  /* eslint-enable */
};
