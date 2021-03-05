/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import { IModelApp, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import { HyperModeling } from "@bentley/hypermodeling-frontend";
import { Button } from "@bentley/ui-core";
import HyperModelingApp from "./HyperModelingApp";

interface HyperModelingState {
  viewport?: ScreenViewport;
  previousView?: ViewState;
}

interface HyperModelingProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

export default class HyperModelingUI extends React.Component<HyperModelingProps, HyperModelingState> {
  public constructor(props: HyperModelingProps) {
    super(props);
    this.state = {};
  }

  private _onIModelReady = async () => {
    IModelApp.viewManager.onViewOpen.addOnce(async (viewport: ScreenViewport) => {
      this.setState({ viewport });
      HyperModelingApp.viewport = viewport;
      await HyperModeling.startOrStop(viewport, true);
      // ###TODO configure marker behavior (toolbar - navigation to 2d views)
    });
  };

  private returnToPreviousView(): void {
    if (this.state.viewport && this.state.previousView) {
      this.state.viewport.changeView(this.state.previousView);
      this.setState({ previousView: undefined });
    }
  }

  private getControls() {
    if (!this.state.previousView) {
      return (
        <>
          <div className="sample-options-2col">
            <span>Something</span>
            <span>Ok</span>
          </div>
        </>
      );
    }

    return (
      <>
        <Button onClick={this.returnToPreviousView}>Return to 3d view</Button>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Click on markers to toggle the corresponding 2d section-cut graphics." controls={this.getControls()} iModelSelector={this.props.iModelSelector} />
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
