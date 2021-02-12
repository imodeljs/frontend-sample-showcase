/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import ScreenSpaceEffectsApp from "./ScreenSpaceEffectsApp";
import { Select, Toggle } from "@bentley/ui-core";
import { effects } from "./Effects";

interface UIState {
  activeEffectIndex: number;
  viewport?: ScreenViewport;
}

interface UIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
  effectNames: string[];
}

export default class ScreenSpaceEffectsUI extends React.Component<UIProps, UIState> {
  public state: UIState = { activeEffectIndex: 0 };

  private readonly _onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    this.setState({ activeEffectIndex: Number.parseInt(event.target.value, 10) });
  }

  private readonly _onIModelReady = () => {
    IModelApp.viewManager.onViewOpen.addOnce((viewport) => this.setState({ viewport }));
  }

  public componentDidUpdate(_prevProp: UIProps, prevState: UIState) {
    if (this.state.viewport === prevState.viewport && this.state.activeEffectIndex === prevState.activeEffectIndex)
      return;

    if (this.state.viewport)
      this.state.viewport.screenSpaceEffects = [this.props.effectNames[this.state.activeEffectIndex]];
  }

  private getControls(): React.ReactNode {
    const options = Object.assign({}, effects.map((x) => x.name));
    return (
      <div className={"sample-options-2col"} style={{ gridTemplateColumns: "1fr 1fr" }}>
        <span>Select Effect:</span>
        <Select value={this.state.activeEffectIndex} onChange={this._onChange} style={{ width: "fit-content" }} options={options} />
      </div>
    );
  }

  public render() {
    const instructions = "Use the drop-down below to select which effect is applied to the viewport.";
    return (
      <>
        <ControlPane instructions={instructions} iModelSelector={this.props.iModelSelector} controls={this.getControls()}></ControlPane>
        <ReloadableViewport onIModelReady={this._onIModelReady} iModelName={this.props.iModelName} />
      </>
    );
  }
}
