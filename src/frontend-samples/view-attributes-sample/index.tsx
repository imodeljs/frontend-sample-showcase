/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { Environment, IModelApp, IModelConnection, Viewport, ViewState3d } from "@bentley/imodeljs-frontend";
import { Toggle } from "@bentley/ui-core";
import { RenderMode } from "@bentley/imodeljs-common";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";

// cSpell:ignore imodels

enum ViewFlag {
  ACS, Grid, HiddenEdges, Monochrome, VisibleEdges, Shadows,
}

interface AttrValues {
  renderMode: RenderMode;
  acs: boolean;
  cameraOn: boolean;
  grid: boolean;
  hiddenEdges: boolean;
  monochrome: boolean;
  shadows: boolean;
  skybox: boolean;
  visibleEdges: boolean;
}

/** This class implements the interaction between the sample and the iModel.js API.  No user interface. */
class ViewAttributesApp {

  public static getAttrValues(vp: Viewport): AttrValues {
    return {
      renderMode: ViewAttributesApp.getRenderModel(vp),
      acs: ViewAttributesApp.getViewFlag(vp, ViewFlag.ACS),
      cameraOn: ViewAttributesApp.isCameraOn(vp),
      grid: ViewAttributesApp.getViewFlag(vp, ViewFlag.Grid),
      hiddenEdges: ViewAttributesApp.getViewFlag(vp, ViewFlag.HiddenEdges),
      monochrome: ViewAttributesApp.getViewFlag(vp, ViewFlag.Monochrome),
      shadows: ViewAttributesApp.getViewFlag(vp, ViewFlag.Shadows),
      skybox: ViewAttributesApp.isSkyboxOn(vp),
      visibleEdges: ViewAttributesApp.getViewFlag(vp, ViewFlag.VisibleEdges),
    };
  }

  // Query flag values using the Viewport API.
  public static getViewFlag(vp: Viewport, flag: ViewFlag): boolean {
    switch (flag) {
      case ViewFlag.ACS: return vp.viewFlags.acsTriad;
      case ViewFlag.Grid: return vp.viewFlags.grid;
      case ViewFlag.HiddenEdges: return vp.viewFlags.hiddenEdges;
      case ViewFlag.Monochrome: return vp.viewFlags.monochrome;
      case ViewFlag.Shadows: return vp.viewFlags.shadows;
      case ViewFlag.VisibleEdges: return vp.viewFlags.visibleEdges;
    }

    return false;
  }

  // Modify flag values using the Viewport API.
  public static setViewFlag(vp: Viewport, flag: ViewFlag, on: boolean) {
    const viewFlags = vp.viewFlags.clone();

    switch (flag) {
      case ViewFlag.ACS:
        viewFlags.acsTriad = on;
        break;
      case ViewFlag.Grid:
        viewFlags.grid = on;
        break;
      case ViewFlag.HiddenEdges:
        viewFlags.hiddenEdges = on;
        break;
      case ViewFlag.Monochrome:
        viewFlags.monochrome = on;
        break;
      case ViewFlag.Shadows:
        viewFlags.shadows = on;
        break;
      case ViewFlag.VisibleEdges:
        viewFlags.visibleEdges = on;
        break;
    }

    vp.viewFlags = viewFlags;
  }

  // Query camera setting using the Viewport API.
  public static isCameraOn(vp: Viewport) {
    return vp.isCameraOn;
  }

  // Modify camera setting using the Viewport API.
  public static setCameraOnOff(vp: Viewport, on: boolean) {
    if (on)
      vp.turnCameraOn();
    else
      (vp.view as ViewState3d).turnCameraOff();

    vp.synchWithView();
  }

  // Query skybox setting using the Viewport API.
  public static isSkyboxOn(vp: Viewport) {
    if (vp.view.is3d()) {
      const displayStyle = vp.view.getDisplayStyle3d();
      return displayStyle.environment.sky.display;
    }

    return false;
  }

  // Modify skybox setting using the Viewport API.
  public static setSkyboxOnOff(vp: Viewport, on: boolean) {
    if (vp.view.is3d()) {
      const style = vp.view.getDisplayStyle3d();
      style.environment = new Environment({ sky: { display: on } });
      vp.invalidateRenderPlan();
    }
  }

  // Query render model setting using the Viewport API.
  public static getRenderModel(vp: Viewport): RenderMode {
    return vp.viewFlags.renderMode;
  }

  // Modify render mode setting using the Viewport API.
  public static setRenderMode(vp: Viewport, mode: RenderMode) {
    const viewFlags = vp.viewFlags.clone();
    viewFlags.renderMode = mode;
    vp.viewFlags = viewFlags;
  }

}

/*
 * From here down is the implementation of the UI for this sample.
 *********************************************************************************************/
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
        renderMode: RenderMode.SmoothShade,
        acs: false,
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
      default:
      case "SmoothShade": { renderMode = RenderMode.SmoothShade; break; }
      case "SolidFill": { renderMode = RenderMode.SolidFill; break; }
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
        <option selected={true} value={"SmoothShade"}> Smooth Shade </option>
        <option value={"SolidFill"}> Solid Fill </option>
        <option value={"Wireframe"}> Wireframe </option>
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
      case ViewFlag.Grid: flagValue = this.state.attrValues.grid; break;
      case ViewFlag.HiddenEdges: flagValue = this.state.attrValues.hiddenEdges; break;
      case ViewFlag.Monochrome: flagValue = this.state.attrValues.monochrome; break;
      case ViewFlag.Shadows: flagValue = this.state.attrValues.shadows; break;
      case ViewFlag.VisibleEdges: flagValue = this.state.attrValues.visibleEdges; break;
    }

    const element = <Toggle isOn={flagValue} onChange={(checked: boolean) => this._onChangeViewFlagToggle(flag, checked)} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  /** Components for rendering the sample's instructions and controls */
  private getControlPane() {
    return (
      <>
        < div className="sample-ui" >
          <div>
            <span>Use the controls below to change the view attributes.</span>
          </div>
          {this.props.iModelSelector}
          <hr></hr>
          <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {this.createRenderModePicker("Render Mode", "Controls the render mode.")}
            {this.createViewFlagToggle(ViewFlag.ACS, "ACS", "Turn on to see a visualization of the active coordinate system.")}
            {this.createCameraToggle("Camera", "Turn on for perspective view.  Turn off for orthographic view.")}
            {this.createViewFlagToggle(ViewFlag.Grid, "Grid", "")}
            {this.createViewFlagToggle(ViewFlag.Monochrome, "Monochrome", "Turn on to disable colors.")}
            {this.createViewFlagToggle(ViewFlag.Shadows, "Shadows", "Turn on to see shadows.")}
            {this.createSkyboxToggle("Sky box", "Turn on to see the sky box.")}
            {this.createViewFlagToggle(ViewFlag.VisibleEdges, "Visible Edges", "Turn off to disable visible edges.  Only applies to smooth shade render mode.")}
            {this.createViewFlagToggle(ViewFlag.HiddenEdges, "Hidden Edges", "Turn on to see hidden edges.  Does not apply to wireframe.  For smooth shade render mode, does not apply when visible edges are off.")}
          </div>
        </div >
      </>
    );
  }

  private onIModelReady = (imodel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: Viewport) => {
      const attrValues = ViewAttributesApp.getAttrValues(vp);
      this.setState({ vp, attrValues });
    });
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady} />
        {this.getControlPane()}
      </>
    );
  }
}
