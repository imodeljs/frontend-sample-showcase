/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { Range3d } from "@bentley/geometry-core";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { BlankConnectionProps, IModelApp } from "@bentley/imodeljs-frontend";
import { BlankConnectionViewState, BlankViewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi } from "@itwinjs-sandbox";
import { Simple3dWidgetProvider } from "./Simple3dWidget";

interface Simple3dState {
  decorator: GeometryDecorator;
  connection: BlankConnectionProps;
  viewState: BlankConnectionViewState;
}

export default class Simple3dUI extends React.Component<{}, Simple3dState> {
  private uiProviders: Simple3dWidgetProvider;

  constructor(props?: any, context?: any) {
    super(props, context);
    const decorator = new GeometryDecorator();
    const connection = BlankViewport.getBlankConnection(new Range3d(-30, -30, -30, 30, 30, 30));
    const blankViewState = BlankViewport.getViewState(true, false)
    this.uiProviders = new Simple3dWidgetProvider(decorator);

    this.state = {
      decorator,
      connection,
      viewState: blankViewState,
    };
  }

  public componentDidMount() {
    if (IModelApp && IModelApp.viewManager) {
      IModelApp.viewManager.addDecorator(this.state.decorator)
    }
  }

  public componentDidUpdate() {
    this.state.decorator.clearGeometry();
  }

  private _onIModelAppInit = () => {
    IModelApp.viewManager.addDecorator(this.state.decorator)
  }

  public render() {
    return (
      <>
        <BlankViewer
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          theme={"dark"}
          defaultUiConfig={default3DSandboxUi}
          uiProviders={[this.uiProviders]}
          onIModelAppInit={this._onIModelAppInit}
          viewStateOptions={this.state.viewState}
          blankConnection={this.state.connection} />      </>
    );
  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

}
