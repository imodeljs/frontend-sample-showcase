/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { BlankConnectionProps, IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { BlankConnectionViewState, BlankViewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi } from "@itwinjs-sandbox";
import { Range3d } from "@bentley/geometry-core";
import { Advanced3dWidgetProvider } from "./Advanced3dWidget";

interface Advanced3dState {
  decorator: GeometryDecorator;
  connection: BlankConnectionProps;
  viewState: BlankConnectionViewState;
}

export default class Advanced3d extends React.Component<{}, Advanced3dState> {
  private uiProviders: Advanced3dWidgetProvider;

  constructor(props?: any, context?: any) {
    super(props, context);
    const decorator = new GeometryDecorator();
    const connection = BlankViewport.getBlankConnection(new Range3d(-30, -30, -30, 30, 30, 30));
    const viewState = BlankViewport.getViewState(true, false)
    this.uiProviders = new Advanced3dWidgetProvider(decorator);

    this.state = {
      decorator,
      connection,
      viewState,
    };
  }

  public componentDidMount() {
    if (IModelApp && IModelApp.viewManager) {
      IModelApp.viewManager.addDecorator(this.state.decorator)
    }
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
          onIModelAppInit={this._onIModelAppInit}
          uiProviders={[this.uiProviders]}
          defaultUiConfig={default3DSandboxUi}
          viewStateOptions={this.state.viewState}
          blankConnection={this.state.connection} />      </>
    );
  }


  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

}
