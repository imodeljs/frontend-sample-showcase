/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { RenderMode } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { ViewSetup } from "api/viewSetup";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";

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

    </>);
  }

  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      this.setState({ vp });
    });
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    viewState.viewFlags.renderMode = RenderMode.Wireframe;
    return viewState;
  }

  /** The sample's render method */
  public render() {

    return (
      <>
        <ControlPane instructions="Use the controls below to change the view attributes." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} />
      </>
    );
  }

}
