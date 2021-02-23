/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Point3d } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { DisplayStyle3dSettingsProps } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, ScreenViewport, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Button, Select } from "@bentley/ui-core";
import { ViewSetup } from "api/viewSetup";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import { PlaceMarkerTool } from "frontend-samples/marker-pin-sample/PlaceMarkerTool";
import * as React from "react";
import { FireDecorator } from "./Particle";

// cSpell:ignore imodels
/** The React state for this UI component */
interface ParticleSampleState {
  viewport?: Viewport;
  effect: Effect;
  isLoading: boolean;
}
interface ParticleSampleProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

interface Effect {
  effectName: string;
  environment: DisplayStyle3dSettingsProps;
}

const snowStyle = {
  environment: {
    sky: { display: true, twoColor: false, groundColor: 9741199, nadirColor: 5464143, skyColor: 16764303, zenithColor: 0xD3D3D3 },
    ground: { display: false },
  },
};
const rainStyle = {
  environment: {
    sky: { display: true, twoColor: false, groundColor: 9741199, nadirColor: 5464143, skyColor: 0xF2C082, zenithColor: 0xC0C0C0 },
    ground: { display: false },
  },
};
const defaultStyle = {
  environment: {
    sky: { display: true, twoColor: false, groundColor: 9741199, nadirColor: 5464143, skyColor: 0xF2C082, zenithColor: 0xC0C0C0 },
    ground: { display: false },
  },
};

/** A React component that renders the UI specific for this sample */
export default class FireDecorationUI extends React.Component<ParticleSampleProps, ParticleSampleState> {

  private readonly _effects: Effect[] = [
    {
      effectName: "Fire",
      environment: defaultStyle,
    },
    {
      effectName: "Snow",
      environment: snowStyle,
    },
    {
      effectName: "Rain",
      environment: rainStyle,
    },
    {
      effectName: "None",
      environment: defaultStyle,
    },
  ];

  /** Creates a Sample instance */
  constructor(props: ParticleSampleProps) {
    super(props);
    this.state = {
      isLoading: true,
      effect: this._effects[0],
    };
  }

  public getControls(): React.ReactNode {
    const entries = this._effects.map((effect) => effect.effectName);
    return (<>
      <span>
        <Button disabled={this.state.isLoading} onClick={() => {
          const vp = IModelApp.viewManager.selectedView;
          if (undefined === vp)
            return;
          IModelApp.tools.run(PlaceMarkerTool.toolId, (point: Point3d) => {
            FireDecorator.create(vp, point);
          });
        }}>Place Emitter</Button>
      </span>
      <div className={"sample-options-2col"}>
        <label>Particles</label>
        <Select value={this.state.effect.effectName} options={entries} onChange={(event) => this.setState({ effect: this._effects.find((effect) => effect.effectName === event.target.value)! })} />
      </div>
    </>);
  }

  private onIModelReady = (_imodel: IModelConnection) => {
    this.setState({ isLoading: false });
  }

  // public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
  //   const viewState = await ViewSetup.getDefaultView(imodel);
  //   // Make view edits here

  //   return viewState;
  // }

  public componentDidUpdate(_prevProps: any, preState: ParticleSampleState) {
    const vp = this.state.viewport;
    if (undefined === vp)
      return;
    const init = preState === undefined && this.state.viewport !== undefined;

    if (init || this.state.effect !== preState.effect)
      vp.overrideDisplayStyle(this.state.effect.environment);
  }

  /** The sample's render method */
  public render() {

    return (
      <>
        <ControlPane instructions="click button to start fire." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
      </>
    );
  }

}
