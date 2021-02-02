/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as  React from "react";
import { BlankConnection, IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
import { StartupComponent } from "../../common/Startup/Startup";
import { ViewSetup } from "api/viewSetup";
import { IModelSelector } from "common/IModelSelector/IModelSelector";


export interface ShowcaseSampleProps {
  iModelConnection: IModelConnection;
  iModelSelector: IModelSelector;
  viewState: ViewState;
}

export interface BlankConnectionProps {
  iModelConnection: BlankConnection;
}

export abstract class ConnectionSample extends React.Component<ShowcaseSampleProps> {


}

export abstract class NoConnectionSample extends React.Component<BlankConnectionProps> {


}

export abstract class BlankConnectionConnectionSample extends React.Component<{}> {


}

export default class SampleLoader extends React.Component<{ iModelName?: string, iModelName2?: string, iModelSelector?: React.ReactNode, sample: typeof React.Component }, { iModelConnection?: IModelConnection, sampleUI: React.ReactNode }> {

  public async setSampleUI() {
    if (this.state && this.props.iModelName && this.state.iModelConnection) {
      const sampleViewState = await ViewSetup.getDefaultView(this.state.iModelConnection)
      //console.log(this.props.sample.prototype)
      //console.log(this.props.sample.arguments)
      const sampleUI = React.createElement(this.props.sample, { iModelConnection: this.state.iModelConnection, iModelSelector: this.props.iModelSelector, viewState: sampleViewState })

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
    if (prevProps.iModelName !== this.props.iModelName) {
      this.setState({ iModelConnection: undefined, sampleUI: undefined })
    } else if (!this.state || !this.state.sampleUI || prevState.iModelConnection !== this.state.iModelConnection)
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
