/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { IModelApp, IModelConnection, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import { RenderMode } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import ViewAttributesApp, { AttrValues, ViewFlag } from "./ViewAttributesApp";
import { ViewSetup } from "api/viewSetup";
import { ControlPane } from "Components/ControlPane/ControlPane";

// cSpell:ignore imodels
/** The React state for this UI component */
interface ViewAttributesState {
  vp?: Viewport;
  attrValues: AttrValues;
}

/** A React component that renders the UI specific for this sample */
export default class ViewAttributesUI extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, ViewAttributesState> {

  /** Creates a Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);
    this.state = {
      attrValues: {
        renderMode: RenderMode.Wireframe,
        acs: false,
        backgroundMap: false,
        backgroundTransparency: 0.01,
        cameraOn: false,
        grid: false,
        hiddenEdges: false,
        monochrome: false,
        shadows: false,
        skybox: false,
        visibleEdges: false,
      },
    };
  }

  // Update the state of the sample react component by querying the API.
  private updateState() {
    if (undefined === this.state.vp)
      return;

    this.setState({ attrValues: ViewAttributesApp.getAttrValues(this.state.vp) });
  }

  // This common function is used to create the react components for each row of the UI.
  private createJSXElementForAttribute(label: string, info: string, element: JSX.Element) {
    return (
      <>
        <span><span style={{ marginRight: "1em" }} className="icon icon-help" title={info}></span>{label}</span>
        {element}
      </>
    );
  }

  // Handle changes to the render mode.
  private _onChangeRenderMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    if (undefined === this.state.vp)
      return;

    let renderMode: RenderMode;

    switch (event.target.value) {
      case "HiddenLine": { renderMode = RenderMode.HiddenLine; break; }
      case "SmoothShade": { renderMode = RenderMode.SmoothShade; break; }
      case "SolidFill": { renderMode = RenderMode.SolidFill; break; }
      default:
      case "Wireframe": { renderMode = RenderMode.Wireframe; break; }
    }

    ViewAttributesApp.setRenderMode(this.state.vp, renderMode);
    this.updateState();
  }

  // Create the react components for the render mode row.
  private createRenderModePicker(label: string, info: string) {
    const element =
      <select style={{ width: "fit-content" }} onChange={this._onChangeRenderMode}>
        <option value={"HiddenLine"}> Hidden Line </option>
        <option value={"SmoothShade"}> Smooth Shade </option>
        <option value={"SolidFill"}> Solid Fill </option>
        <option selected={true} value={"Wireframe"}> Wireframe </option>
      </select>;

    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handle changes to the skybox toggle.
  private _onChangeSkyboxToggle = (checked: boolean) => {
    if (undefined === this.state.vp)
      return;

    ViewAttributesApp.setSkyboxOnOff(this.state.vp, checked);
  }

  // Create the react components for the skybox toggle row.
  private createSkyboxToggle(label: string, info: string) {
    const element = <Toggle isOn={this.state.attrValues.skybox} onChange={(checked: boolean) => this._onChangeSkyboxToggle(checked)} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handle changes to the camera toggle.
  private _onChangeCameraToggle = (checked: boolean) => {
    if (undefined === this.state.vp)
      return;

    ViewAttributesApp.setCameraOnOff(this.state.vp, checked);
  }

  // Create the react components for the camera toggle row.
  private createCameraToggle(label: string, info: string) {
    const element = <Toggle isOn={this.state.attrValues.cameraOn} onChange={(checked: boolean) => this._onChangeCameraToggle(checked)} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handle changes to a view flag toggle.
  private _onChangeViewFlagToggle = (flag: ViewFlag, checked: boolean) => {
    if (undefined === this.state.vp)
      return;

    ViewAttributesApp.setViewFlag(this.state.vp, flag, checked);
    this.updateState();
  }

  // Create the react components for a view flag row.
  private createViewFlagToggle(flag: ViewFlag, label: string, info: string) {
    let flagValue: boolean;

    switch (flag) {
      case ViewFlag.ACS: flagValue = this.state.attrValues.acs; break;
      case ViewFlag.BackgroundMap: flagValue = this.state.attrValues.backgroundMap; break;
      case ViewFlag.Grid: flagValue = this.state.attrValues.grid; break;
      case ViewFlag.HiddenEdges: flagValue = this.state.attrValues.hiddenEdges; break;
      case ViewFlag.Monochrome: flagValue = this.state.attrValues.monochrome; break;
      case ViewFlag.Shadows: flagValue = this.state.attrValues.shadows; break;
      case ViewFlag.VisibleEdges: flagValue = this.state.attrValues.visibleEdges; break;
    }

    const element = <Toggle isOn={flagValue} onChange={(checked: boolean) => this._onChangeViewFlagToggle(flag, checked)} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Create the react component for the transparency slider
  private createTransparencySlider(label: string, info: string) {
    if (this.state.vp) {
      const element = <input type={"range"} min={0} max={99} defaultValue={99} onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
        if (this.state.vp)
          // The calculation used here converts the whole number range 0 to 99 into a range from 1 to 0
          // This allows the rightmost value of the slider to be opaque, while the leftmost value is completely transparent
          ViewAttributesApp.setBackgroundTransparency(this.state.vp, Math.abs((Number(event.target.value) / 100) - 1));
      }} />;
      return this.createJSXElementForAttribute(label, info, element);
    }
  }

  public getControls(): React.ReactNode {
    return (
      <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
        {this.createRenderModePicker("Render Mode", "Controls the render mode.")}
        {this.createViewFlagToggle(ViewFlag.ACS, "ACS", "Turn on to see a visualization of the active coordinate system.")}
        {this.createViewFlagToggle(ViewFlag.BackgroundMap, "Background Map", "Turn on to see the iModel on a map. Turn off to disable map. Does not apply if the selected iModel is not geolocated.")}
        {this.createTransparencySlider("Map Transparency", "Adjusting this slider changes the transparency of the background map. Does not apply if map is not currently being displayed.")}
        {this.createCameraToggle("Camera", "Turn on for perspective view.  Turn off for orthographic view.")}
        {this.createViewFlagToggle(ViewFlag.Grid, "Grid", "")}
        {this.createViewFlagToggle(ViewFlag.Monochrome, "Monochrome", "Turn on to disable colors.")}
        {this.createViewFlagToggle(ViewFlag.Shadows, "Shadows", "Turn on to see shadows.")}
        {this.createSkyboxToggle("Sky box", "Turn on to see the sky box.")}
        {this.createViewFlagToggle(ViewFlag.VisibleEdges, "Visible Edges", "Turn off to disable visible edges.  Only applies to smooth shade render mode.")}
        {this.createViewFlagToggle(ViewFlag.HiddenEdges, "Hidden Edges", "Turn on to see hidden edges.  Does not apply to wireframe.  For smooth shade render mode, does not apply when visible edges are off.")}
      </div>
    );
  }

  private onIModelReady = (_imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      const attrValues = ViewAttributesApp.getAttrValues(vp);
      ViewAttributesApp.setBackgroundTransparency(vp, 0.01);
      this.setState({ vp, attrValues });
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
