/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import {
  IModelApp, IModelConnection,
  PanViewTool, RotateViewTool, SelectionTool, FitViewTool, ViewState, ZoomViewTool,
} from "@bentley/imodeljs-frontend";

import { ViewportComponent } from "@bentley/ui-components";
import { viewWithUnifiedSelection } from "@bentley/presentation-components";
import "./Toolbar.scss";

// create a HOC viewport component that supports unified selection
// tslint:disable-next-line:variable-name
const SimpleViewport = viewWithUnifiedSelection(ViewportComponent);

/** React props for [[ViewportAndNavigationComponents]] component */
export interface ViewportAndNavigationProps {
  /** iModel whose contents should be displayed in the viewport */
  imodel: IModelConnection;
  /** View state to use when the viewport is first loaded */
  viewState: ViewState;
}

/** Renders viewport, toolbar, and associated elements */
export class ViewportAndNavigation extends React.PureComponent<ViewportAndNavigationProps> {
  public render() {
    return (
      <>
        <SimpleViewport
          style={{ flexGrow: 1 }}
          imodel={this.props.imodel}
          viewState={this.props.viewState}
        />
        {toolbar()}
      </>
    );
  }
}

/** Toolbar containing simple navigation tools */
const toolbar = () => {
  return (
    <div className="toolbar">
      <a href="#" title={SelectionTool.flyover} onClick={select}><span className="icon icon-cursor"></span></a>
      <a href="#" title={FitViewTool.flyover} onClick={fitView}><span className="icon icon-fit-to-view"></span></a>
      <a href="#" title={RotateViewTool.flyover} onClick={rotate}><span className="icon icon-gyroscope"></span></a>
      <a href="#" title={PanViewTool.flyover} onClick={pan}><span className="icon icon-hand-2"></span></a>
      <a href="#" title={ZoomViewTool.flyover} onClick={zoom}><span className="icon icon-zoom"></span></a>
    </div>
  );
};

/**
 * See the https://imodeljs.github.io/iModelJs-docs-output/learning/frontend/tools/
 * for more details and available tools.
 */

const select = () => {
  IModelApp.tools.run(SelectionTool.toolId);
};

const fitView = () => {
  IModelApp.tools.run(FitViewTool.toolId, IModelApp.viewManager.selectedView);
};

const rotate = () => {
  IModelApp.tools.run(RotateViewTool.toolId, IModelApp.viewManager.selectedView);
};

const pan = () => {
  IModelApp.tools.run(PanViewTool.toolId, IModelApp.viewManager.selectedView);
};

const zoom = () => {
  IModelApp.tools.run(ZoomViewTool.toolId, IModelApp.viewManager.selectedView);
};
