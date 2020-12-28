/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, IModelConnection, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Button } from "@bentley/ui-core";
import { ViewSetup } from "api/viewSetup";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { PlaceMarkerTool } from "frontend-samples/marker-pin-sample/PlaceMarkerTool";
import * as React from "react";
import { FireDecorator, FireDecoratorPoint, FireDecoratorSource } from "./FireDecorator";

// cSpell:ignore imodels
/** The React state for this UI component */
interface FireDecorationState {
  vp?: Viewport;
}

/** A React component that renders the UI specific for this sample */
export default class FireDecorationUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, FireDecorationState> {

  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {

    };
  }

  // Update the state of the sample react component by querying the API.
  private updateState() {
    if (undefined === this.state.vp)
      return;

  }

  public getControls(): React.ReactNode {
    return (<>
      <Button onClick={() => {
        const vp = IModelApp.viewManager.selectedView;
        if (undefined === vp)
          return;
        FireDecorator.enable();
      }}>Fire</Button>
      <Button onClick={() => {
        const vp = IModelApp.viewManager.selectedView;
        if (undefined === vp)
          return;
        // IModelApp.tools.run(PlaceMarkerTool.toolId, (point: Point3d) => {
        //   IModelApp.viewManager.addDecorator(new FireDecoratorSource(point, vp));
        // });
        FireDecoratorPoint.enable();
      }}>Placement</Button>
    </>);
  }

  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      this.setState({ vp });
    });
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    // Make view edits here

    return viewState;
  }

  /** The sample's render method */
  public render() {

    return (
      <>
        <ControlPane instructions="click button to start fire." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} />
      </>
    );
  }

}
