/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { DisplayStyle3dSettingsProps } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import { Button, Select } from "@bentley/ui-core";
import { ViewSetup } from "api/viewSetup";
import "common/samples-common.scss";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import Particles from "react-tsparticles";
import { FireDecorator, FireDecoratorPoint } from "./FireDecorator";

// cSpell:ignore imodels
/** The React state for this UI component */
interface FireDecorationState {
  screenRectangle?: ClientRect;
  effect: EffectTypes;
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
const effects: any[] = [];
const styles: DisplayStyle3dSettingsProps[] = [snowStyle, rainStyle];
enum EffectTypes {
  Snow = 0,
  Rain = 1,
}

/** A React component that renders the UI specific for this sample */
export default class FireDecorationUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, FireDecorationState> {

  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);
    this.state = {
      effect: EffectTypes.Snow,
    };
  }

  // Update the state of the sample react component by querying the API.
  private updateState() {
    const vp = IModelApp.viewManager.selectedView;

    this.setState({ screenRectangle: vp?.getClientRect() });
  }

  public getControls(): React.ReactNode {
    const entries = Object.assign({}, Object.keys(EffectTypes).filter((key: any) => isNaN(key)));
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
      <Select value={this.state.effect} options={entries} onChange={(event) => this.setState({ effect: Number.parseInt(event.target.value, 10) })} />
    </>);
  }

  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {
      vp.onRender.addListener(() => {
        const rect = vp.getClientRect();
        const stateRect = this.state.screenRectangle;
        if (stateRect?.width !== rect.width || stateRect?.height !== rect.height)
          this.updateState();
      });
      vp.overrideDisplayStyle(styles[this.state.effect as number]);
      this.updateState();
    });
  }

  public getInitialView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewState = await ViewSetup.getDefaultView(imodel);
    // Make view edits here

    return viewState;
  }

  public componentDidUpdate(_prevProps: any, preState: FireDecorationState) {
    const vp = IModelApp.viewManager.selectedView;
    if (!vp) return;
    if (this.state.effect !== preState.effect)
      vp.overrideDisplayStyle(styles[this.state.effect as number]);
  }

  /** The sample's render method */
  public render() {
    const rect = this.state.screenRectangle;

    return (
      <>
        <style> {"#particles span { \
            pointer-events: none !important; \
          }"}
        </style>
        <ControlPane instructions="click button to start fire." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} getCustomViewState={this.getInitialView} />
        {rect === undefined ? <></> :
          <div style={{ position: "fixed", top: rect.top, left: rect.left, pointerEvents: "none" }} >
            <Particles style={{ pointerEvents: "none" }} width={rect.width} height={rect.height} id="particles" options={effects[this.state.effect]} />
          </div>
        }
      </>
    );
  }

}
