/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import { ControlPane } from "common/ControlPane/ControlPane";
import { SandboxViewport } from "common/SandboxViewport/SandboxViewport";
import * as React from "react";
import { assert } from "@bentley/bentleyjs-core";
import { IModelApp, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import { HyperModeling, SectionMarker } from "@bentley/hypermodeling-frontend";
import { Button } from "@bentley/ui-core";
import HyperModelingApp from "./HyperModelingApp";

interface HyperModelingState {
  viewport?: ScreenViewport;
  previousView?: ViewState;
  activeMarker?: SectionMarker;
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
      await HyperModelingApp.enableHyperModeling(viewport);
      HyperModelingApp.markerHandler.onActiveMarkerChanged.addListener((activeMarker) => this.setState({ activeMarker }));
    });
  };

  public async componentWillUnmount() {
    if (this.state.viewport)
      await HyperModelingApp.disableHyperModeling(this.state.viewport);
  }

  private returnToPreviousView = () => {
    if (this.state.viewport && this.state.previousView) {
      this.state.viewport.changeView(this.state.previousView);
      this.setState({ previousView: undefined });
    }
  };

  private switchToDrawingView = async () => {
    return this.switchTo2d("drawing");
  };

  private switchToSheetView = async () => {
    return this.switchTo2d("sheet");
  };

  private async switchTo2d(which: "sheet" | "drawing") {
    const viewport = this.state.viewport;
    const marker = this.state.activeMarker;
    assert(undefined !== viewport && undefined !== marker);

    // Some section drawing locations are not associated with a sheet.
    if ("sheet" === which && !marker.state.viewAttachment)
      return;

    const previousView = viewport.view;
    const promise = "sheet" === which ? HyperModelingApp.switchToSheetView(viewport, marker) : HyperModelingApp.switchToDrawingView(viewport, marker);
    if (await promise)
      this.setState({ previousView });
  }

  private getControls() {
    if (this.state.previousView) {
      return (
        <Button onClick={this.returnToPreviousView}>Return to 3d view</Button>
      );
    }

    if (this.state.activeMarker) {
      return (
        <>
          <Button onClick={this.switchToDrawingView}>View section drawing</Button>
          <Button onClick={this.switchToSheetView}>View on sheet</Button>
        </>
      );
    }

    return (
      <>
        <div className="sample-options-2col">
          <span>Something</span>
          <span>Ok</span>
        </div>
      </>
    );
  }

  public render() {
    return (
      <>
        <ControlPane instructions="Click on markers to toggle the corresponding 2d section-cut graphics." controls={this.getControls()} iModelSelector={this.props.iModelSelector} />
        <SandboxViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
