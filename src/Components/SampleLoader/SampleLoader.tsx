/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as  React from "react";
import { BlankConnection, IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { StartupComponent } from "../../common/Startup/Startup";
import { ViewSetup } from "api/viewSetup";
import { BlankViewport } from "common/Geometry/BlankViewport";
import { Range3d } from "@bentley/geometry-core";


export interface ConnectionProps extends React.Attributes {
  iModelConnection: IModelConnection;
  defaultViewState: ViewState;
  iModelSelector?: React.ReactNode;
}

export interface BlankConnectionProps extends React.Attributes {
  iModelConnection: BlankConnection;
  defaultViewState: ViewState;
}


export default class SampleLoader extends React.Component<{ iModelName?: string, iModelName2?: string, iModelSelector?: React.ReactNode, sample: typeof React.Component }, { iModelConnection?: IModelConnection, sampleUI: React.ReactNode }> {

  public async setSampleUI() {
    if (this.props.iModelName) {
      if (this.state && this.state.iModelConnection) {
        const defaultViewState = await ViewSetup.getDefaultView(this.state.iModelConnection)
        const props: ConnectionProps = {
          iModelConnection: this.state.iModelConnection,
          defaultViewState,
          iModelSelector: this.props.iModelSelector,
        }
        const sampleUI = React.createElement(this.props.sample, props)

        if (sampleUI)
          this.setState({ sampleUI })
      }
    } else {
      const connection = BlankViewport.getBlankConnection(new Range3d(-30, -30, -30, 30, 30, 30));
      const defaultViewState = BlankViewport.getViewState(connection, true, true)
      const props: BlankConnectionProps = {
        iModelConnection: connection,
        defaultViewState,
      }
      const sampleUI = React.createElement(this.props.sample, props)
      if (sampleUI)
        this.setState({ sampleUI })
    }
  }

  public setIModelConnection(iModelConnection: IModelConnection) {
    this.setState({ iModelConnection });
  }

  public componentDidMount() {
    this.setSampleUI()

  }

  public componentDidUpdate(prevProps: { iModelName?: string, iModelName2?: string, iModelSelector?: React.ReactNode, sample: typeof React.Component }, prevState: { iModelConnection?: IModelConnection, sampleUI: React.ReactNode }) {
    if (prevProps.iModelName !== this.props.iModelName || prevProps.sample !== this.props.sample) {
      this.setState({ iModelConnection: undefined, sampleUI: undefined })
    } else if (!this.state || !this.state.sampleUI || (prevState && prevState.iModelConnection !== this.state.iModelConnection))
      this.setSampleUI()
  }

  public render() {
    if (this.props.iModelName && (!this.state || !this.state.iModelConnection)) {
      // An IModelConnection is required for the sample, but does not exist, use StartupComponent
      return (
        <>
          <StartupComponent iModelName={this.props.iModelName} iModelName2={this.props.iModelName2} onIModelReady={this.setIModelConnection.bind(this)} />
        </>
      );
    } else if (this.state && this.state.sampleUI) {
      return (
        this.state.sampleUI

      );
    } else {
      return <></>;
    }
  }

  public static showSample(sample: typeof React.Component, iModelName?: string, iModelName2?: string, iModelSelector?: React.ReactNode) {
    return <SampleLoader iModelName={iModelName} iModelName2={iModelName2} iModelSelector={iModelSelector} sample={sample}></SampleLoader>
  }

}
