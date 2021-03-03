/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import {
  FitViewTool, IModelApp, IModelConnection,
  PanViewTool, RotateViewTool, SelectionTool, ViewState, ZoomViewTool,
} from "@bentley/imodeljs-frontend";

import { ViewportComponent } from "@bentley/ui-components";
import { viewWithUnifiedSelection } from "@bentley/presentation-components";
import "./Toolbar.scss";

// create a HOC viewport component that supports unified selection
// eslint-disable-next-line @typescript-eslint/naming-convention
const SimpleViewport = viewWithUnifiedSelection(ViewportComponent);

/** React props for [[ViewportAndNavigationComponents]] component */
export interface ViewportAndNavigationProps {
  /** iModel whose contents should be displayed in the viewport */
  imodel: IModelConnection;
  /** View state to use when the viewport is first loaded */
  viewState: ViewState;

  isNavigationToolInvisible?: boolean;
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
        { (this.props.isNavigationToolInvisible === undefined) && toolbar()}
      </>
    );
  }
}

/** Toolbar containing simple navigation tools */
const toolbar = () => {
  /* eslint-disable */
  return (
    <div className="toolbar">
      <a href="#" title={SelectionTool.flyover} onClick={(e) => { e.preventDefault(); select(); }}><span className="icon icon-cursor"></span></a>
      <a href="#" title={FitViewTool.flyover} onClick={(e) => { e.preventDefault(); fitView(); }}><span className="icon icon-fit-to-view"></span></a>
      <a href="#" title={RotateViewTool.flyover} onClick={(e) => { e.preventDefault(); rotate(); }}><span className="icon icon-gyroscope"></span></a>
      <a href="#" title={PanViewTool.flyover} onClick={(e) => { e.preventDefault(); pan(); }}><span className="icon icon-hand-2"></span></a>
      <a href="#" title={ZoomViewTool.flyover} onClick={(e) => { e.preventDefault(); zoom(); }}><span className="icon icon-zoom"></span></a>
    </div>
  );
  /* eslint-enable */
};

/**
 * See https://www.itwinjs.org/learning/frontend/tools/
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
