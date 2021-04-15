/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { BlankConnectionProps, IModelApp } from "@bentley/imodeljs-frontend";
import { BlankConnectionViewState, BlankViewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi } from "@itwinjs-sandbox";
import { Range3d } from "@bentley/geometry-core";
import { SimpleLineWidget, SimpleLineWidgetProvider } from "./SimpleLineWidget";

interface SimpleLineState {
  point1X: number;
  point1Y: number;
  point2X: number;
  point2Y: number;
  decorator: GeometryDecorator;
  connection: BlankConnectionProps;
  viewState: BlankConnectionViewState;
}

export default class SimpleLine extends React.Component<{}, SimpleLineState> {
  private uiProviders: SimpleLineWidgetProvider;

  constructor(props?: any, context?: any) {
    super(props, context);
    const decorator = new GeometryDecorator();
    const connection = BlankViewport.getBlankConnection(new Range3d(-35, -35, -35, 35, 35, 35));
    const blankViewState = BlankViewport.getViewState(true, true);
    this.uiProviders = new SimpleLineWidgetProvider(decorator);
    this.state = {
      point1X: -25,
      point1Y: -25,
      point2X: 20,
      point2Y: 20,
      decorator,
      connection,
      viewState: blankViewState,
    };
  }


  public render() {
    return (
      <>
        <BlankViewer
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          theme={"dark"}
          onIModelAppInit={this._onIModelAppInit}
          defaultUiConfig={default3DSandboxUi}
          viewStateOptions={this.state.viewState}
          blankConnection={this.state.connection}
          uiProviders={[this.uiProviders]}
        />
      </>
    );
  }

  private _onIModelAppInit = () => {
    IModelApp.viewManager.addDecorator(this.state.decorator)
    //this.setGeometry();
  }

  public componentDidMount() {
    if (IModelApp && IModelApp.viewManager) {
      IModelApp.viewManager.addDecorator(this.state.decorator)
      //this.setGeometry();
    }
  }

  public componentDidUpdate() {
    //this.setGeometry();
  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

}
