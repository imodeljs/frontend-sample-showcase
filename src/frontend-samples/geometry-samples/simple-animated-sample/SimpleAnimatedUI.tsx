/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { Range3d } from "@bentley/geometry-core";;
import { BlankConnectionProps, IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { BlankConnectionViewState, BlankViewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi } from "@itwinjs-sandbox";
import { SimpleAnimatedWidgetProvider } from "./SimpleAnimatedWidget";

interface SimpleAnimatedState {
  decorator: GeometryDecorator;
  connection: BlankConnectionProps;
  viewState: BlankConnectionViewState;
}

export default class SimpleAnimatedUI extends React.Component<{}, SimpleAnimatedState> {
  private uiProviders: SimpleAnimatedWidgetProvider;

  constructor(props?: any, context?: any) {
    super(props, context);
    const decorator = new GeometryDecorator();
    const connection = BlankViewport.getBlankConnection(new Range3d(-150, -150, 0, 1150, 1150, 0));
    const viewState = BlankViewport.getViewState(false, true);
    this.uiProviders = new SimpleAnimatedWidgetProvider(decorator);

    this.state = {
      decorator,
      viewState,
      connection,
    };
  }

  private _onIModelAppInit = () => {
    IModelApp.viewManager.addDecorator(this.state.decorator)
  }

  public componentDidMount() {
    if (IModelApp && IModelApp.viewManager) {
      IModelApp.viewManager.addDecorator(this.state.decorator)
    }

  }

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
  }

  public render() {
    return (
      <>
        <BlankViewer
          authConfig={{ oidcClient: AuthorizationClient.oidcClient }}
          theme={"dark"}
          onIModelAppInit={this._onIModelAppInit}
          defaultUiConfig={default3DSandboxUi}
          uiProviders={[this.uiProviders]}
          viewStateOptions={this.state.viewState}
          blankConnection={this.state.connection} />
      </>
    );
  }

}
