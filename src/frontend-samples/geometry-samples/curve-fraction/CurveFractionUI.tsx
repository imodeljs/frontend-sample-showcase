/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { ControlPane } from "common/ControlPane/ControlPane";
import { NumericInput, Slider } from "@bentley/ui-core";
import CurveFractionApp from "./CurveFractionApp";
import { SampleCurveFactory } from "common/Geometry/SampleCurveFactory";
import { InteractivePointMarker, MovePointTool } from "common/Geometry/InteractivePointMarker";
import { CurvePrimitive, LineSegment3d, LineString3d, Loop, Point3d, Range3d, Vector3d } from "@bentley/geometry-core";
import { ColorDef, LinePixels } from "@bentley/imodeljs-common";
import { BlankConnectionProps, IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { BlankConnectionViewState, BlankViewer } from "@bentley/itwin-viewer-react";
import { AuthorizationClient, default3DSandboxUi } from "@itwinjs-sandbox";
import { CurveFractionWidget, CurveFractionWidgetProvider } from "./CurveFractionWidget";

interface CurveFractionState {
  decorator: GeometryDecorator;
  connection: BlankConnectionProps;
  viewState: BlankConnectionViewState;
}

export default class CurveFractionUI extends React.Component<{}, CurveFractionState> {
  private uiProviders: CurveFractionWidgetProvider;

  constructor(props?: any) {
    super(props);
    const decorator = new GeometryDecorator();
    const connection = BlankViewport.getBlankConnection(new Range3d(-35, -35, -35, 35, 35, 35));
    const viewState = BlankViewport.getViewState(true, true);
    this.uiProviders = new CurveFractionWidgetProvider(decorator);

    this.state = {
      decorator,
      connection,
      viewState,
    };
  }

  private _onIModelAppInit = () => {
    IModelApp.viewManager.addDecorator(this.state.decorator);
    const sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
    MovePointTool.register(sampleNamespace);

  };


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

  public componentWillUnmount() {
    IModelApp.viewManager.dropDecorator(this.state.decorator);
    IModelApp.tools.unRegister(MovePointTool.toolId);
  }

  public async componentDidMount() {
    if (IModelApp && IModelApp.viewManager) {
      IModelApp.viewManager.addDecorator(this.state.decorator);
      const sampleNamespace = IModelApp.i18n.registerNamespace("camera-i18n-namespace");
      MovePointTool.register(sampleNamespace);
    }
  }

}
