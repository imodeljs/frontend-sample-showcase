/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as  React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { StartupComponent } from "../../common/Startup/Startup";

export default class ShowcaseSample extends React.Component<{ iModelName?: string, iModelName2?: string, iModelSelector?: React.ReactNode, sample: (iModelConnection?: IModelConnection, iModelSelector?: React.ReactNode) => Promise<React.ReactNode> }, { iModelConnection?: IModelConnection, sampleUI: React.ReactNode }> {

  public async setSampleUI() {
    if (this.state && this.props.iModelName && this.state.iModelConnection) {
      const sampleUI = await this.props.sample(this.state.iModelConnection, this.props.iModelSelector)
      this.setState({ sampleUI })
    }
  }

  public setIModelConnection(iModelConnection: IModelConnection) {
    this.setState({ iModelConnection });
  }

  public componentDidMount() {
    this.setSampleUI()

  }

  public componentDidUpdate(prevProps: { iModelName?: string, iModelName2?: string, iModelSelector?: React.ReactNode, sample: (iModelConnection?: IModelConnection, iModelSelector?: React.ReactNode) => React.ReactNode }, prevState: { iModelConnection?: IModelConnection, sampleUI: React.ReactNode }) {
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
        <>
          {this.state.sampleUI}
        </>
      );
    } else {
      return <></>;
    }
  }

  public static showSample(sample: (iModelConnection?: IModelConnection, iModelSelector?: React.ReactNode) => React.ReactNode, iModelName?: string, iModelName2?: string, iModelSelector?: React.ReactNode) {
    return <ShowcaseSample iModelName={iModelName} iModelName2={iModelName2} iModelSelector={iModelSelector} sample={sample}></ShowcaseSample>
  }

}
