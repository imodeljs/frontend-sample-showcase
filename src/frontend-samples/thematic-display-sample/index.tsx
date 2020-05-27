/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Range1d, Range1dProps } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ColorDef, ThematicDisplay, ThematicDisplayProps, ThematicGradientColorScheme } from "@bentley/imodeljs-common";
import { IModelApp, IModelAppOptions, IModelConnection, Viewport, ViewState3d, StandardViewId, ScreenViewport, ViewState } from "@bentley/imodeljs-frontend";
import { Slider, Toggle } from "@bentley/ui-core";
import * as React from "react";
import { GithubLink } from "../../Components/GithubLink";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import { ViewSetup } from "../../api/viewSetup";

// cSpell:ignore imodels
export function getThematicDisplaySpec(): SampleSpec {
  return ({
    name: "thematic-display-sample",
    label: "Thematic Display",
    image: "thematic-display-thumbnail.png",
    setup: ThematicDisplaySampleApp.setup,
    teardown: ThematicDisplaySampleApp.teardown,
  });
}

/** This file contains the user interface and main logic that is specific to this sample. */
class API {
  /** Render changes to viewport using Viewport API. */
  public static syncViewport(vp: Viewport): void {
    vp.synchWithView();
  }

  /** Tests is the iModel able to be displayed with thematic. */
  public static isThematicDisplaySupported(vp: Viewport): boolean {
    return vp.view.is3d();
  }

  /** Query view flags using Viewport API. */
  public static isThematicDisplayOn(vp: Viewport): boolean {
    return vp.viewFlags.thematicDisplay;
  }

  /** Query Thematic Display settings with the Viewport API. */
  public static getThematicDisplayProps(vp: Viewport): ThematicDisplayProps {
    const thematic = (vp.view as ViewState3d).getDisplayStyle3d().settings.thematic;
    return thematic.toJSON();
  }

  /** Query project extents using the Viewport API. */
  public static getProjectExtents(vp: Viewport): Range1dProps {
    const extents = vp.iModel.projectExtents;
    return {low: extents.zLow, high: extents.zHigh};
  }

  /** Modify the view flags using the Viewport API. */
  public static setThematicDisplayOnOff(vp: Viewport, on: boolean) {
    const vf = vp.viewFlags.clone();
    vf.thematicDisplay = on;
    vp.viewFlags = vf;
  }

  /** Overwrite the settings using the Viewport API.  Any props not set will be set to default value by iModel.js.
  * Note: changes to the settings will not be seen until the view is updated.  Use the 'syncViewport' method to do this.
  * While it would be simplest to call syncViewport here, I will be calling it in the controls to optimize setting multiple props.
   */
  public static setThematicDisplayProps(vp: Viewport, props?: ThematicDisplayProps): void {
    const displaySettings = (vp.view as ViewState3d).getDisplayStyle3d().settings;
    displaySettings.thematic = ThematicDisplay.fromJSON(props);
  }

  // All API below here are modifying specific props and use the API.setThematicProps(...) method.

  /** Modify the range setting using the Viewport API. */
  public static setThematicDisplayRange(vp: Viewport, range: Range1dProps) {
    const props = API.getThematicDisplayProps(vp);
    props.range = range;
    this.setThematicDisplayProps(vp, props);
  }

  /** Modify the gradient color scheme setting using the Viewport API. */
  public static setThematicDisplayGradientColorScheme(vp: Viewport, colorScheme: ThematicGradientColorScheme) {
    const props = API.getThematicDisplayProps(vp);
    if (undefined === props.gradientSettings)
      props.gradientSettings = {};
    props.gradientSettings.colorScheme = colorScheme;
    this.setThematicDisplayProps(vp, props);
  }
}

/** Handles the setup and teardown of the thematic display sample */
export class ThematicDisplaySampleApp {
  public static originalProps?: ThematicDisplayProps;
  public static originalFlag: boolean  = false;
  public static viewport?: Viewport;

  /** Called by the showcase before the sample is started. */
  public static async setup(iModelName: string): Promise<React.ReactNode> {
    return <ThematicDisplaySampleUIComponent iModelName={iModelName} />;
  }

  /** Called by the showcase before swapping to another sample. */
  public static teardown(): void {
    if (undefined === this.viewport) return
    API.setThematicDisplayProps(this.viewport, this.originalProps);
    API.setThematicDisplayOnOff(this.viewport, this.originalFlag);
  }
}

/** React state of the Sample component */
interface SampleState {
  on: boolean;
  range: Range1dProps;
  extents: Range1dProps;
  colorScheme: ThematicGradientColorScheme;
}

/** React props for the Sample component */
interface ThematicDisplaySampleUIProps {
  iModelName: string;
}

/** A React component that renders the UI specific for this sample */
export class ThematicDisplaySampleUIComponent extends React.Component<ThematicDisplaySampleUIProps, SampleState> {

  // defining the Thematic Display Props values that are not what is need at default,
  private static readonly _defaultProps: ThematicDisplayProps = {
    axis: [0.0, 0.0, 1.0],
    gradientSettings: { marginColor: ColorDef.white.toJSON() },
  };

  /** Creates a Sample instance */
  constructor(props?: any, context?: any) {
    super(props, context);

    // placeholder state till set based on the view
    this.state = {
      on: false,
      range: [0, 1],
      extents: [0, 1],
      colorScheme: ThematicGradientColorScheme.Custom,
    };
  }

  /** This method is called when the iModel is loaded by the react component */
  private _onIModelReady = (_iModel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {
      ThematicDisplaySampleUIComponent.init(vp);
      this.updateState();
    });
  }

  /** This method should be called when the iModel is loaded to set default settings in the 
   * viewport settings to enable thematic display.
   */
  public static init(vp: Viewport) {
    // Test that view is compatible with thematic display.
    if (undefined === vp || !API.isThematicDisplaySupported(vp)) {
      alert("iModel is not compatible with thematic display, please use an iModel with a 3d view.");
      return;
    }

    // Set the default values.
    API.setThematicDisplayProps(vp, this._defaultProps);

    // Will enable Thematic Display over the whole iModel.
    const extents = API.getProjectExtents(vp);
    API.setThematicDisplayRange(vp, extents);

    // Redraw viewport with new settings
    API.syncViewport(vp);

    // Turn on
    // Note: Since this function is modifying the view flags, the view does not need to be synced to see the changes.
    API.setThematicDisplayOnOff(vp, true);
  }

  /** Update the state of the sample react component by querying the API. */
  public updateState() {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    const props = API.getThematicDisplayProps(vp);
    const extents = API.getProjectExtents(vp);
    const range = props.range;

    let colorScheme = props.gradientSettings?.colorScheme;
    if (undefined === colorScheme)
      colorScheme = ThematicGradientColorScheme.BlueRed;

    this.setState({
      on: API.isThematicDisplayOn(vp),
      extents: undefined === extents ? [0, 1] : extents,
      range: undefined === range ? [0, 1] : range,
      colorScheme,
    });
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

  // Handle changes to the thematic display toggle.
  private _onChangeThematicDisplayToggle = (checked: boolean) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    API.setThematicDisplayOnOff(vp, checked);
    this.updateState();
  }

  // Creates the react components for the thematic display toggle row.
  private createThematicDisplayToggle(label: string, info: string) {
    const element = <Toggle isOn={this.state.on} onChange={(checked: boolean) => this._onChangeThematicDisplayToggle(checked)} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handles updates to the thematic range slider
  private _onUpdateRangeSlider = (values: readonly number[]) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // This keeps the high and low from crossing
    const newRange = Range1d.createXX(values[0], values[1]);

    API.setThematicDisplayRange(vp, newRange);
    API.syncViewport(vp);
    this.updateState();
  }

  // Create a component for controlling the range the thematic display
  private createThematicDisplayRangeSlider(label: string, info: string) {
    const extents = Range1d.fromJSON(this.state.extents);
    const range = Range1d.fromJSON(this.state.range);

    const step = 1;
    const element = <Slider min={extents.low} max={extents.high} step={step}
      values={[range.low, range.high]} onUpdate={this._onUpdateRangeSlider}/>;

    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handle changes to the display mode.
  private _onChangeColorScheme = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const colorScheme: ThematicGradientColorScheme = Number.parseInt(event.target.value);

    API.setThematicDisplayGradientColorScheme(vp, colorScheme);
    API.syncViewport(vp);
    this.updateState();
  }

  // Create the react components for the render mode row.
  private createColorSchemePicker(label: string, info: string) {
    const element =
      <select style={{ width: "fit-content" }} onChange={this._onChangeColorScheme}
        value={this.state.colorScheme}>
        <option value={ThematicGradientColorScheme.BlueRed}> Blue & Red </option>
        <option value={ThematicGradientColorScheme.Monochrome}> Monochrome </option>
        <option value={ThematicGradientColorScheme.RedBlue}> Red & Blue </option>
        <option value={ThematicGradientColorScheme.SeaMountain}> Sea Mountain </option>
        <option value={ThematicGradientColorScheme.Topographic}> Topographic </option>
        {/* <option value={ThematicGradientColorScheme.Custom}> Custom </option> */}
      </select>;

    return this.createJSXElementForAttribute(label, info, element);
  }

  /** Components for rendering the sample's instructions and controls */
  public getControlPane() {
    return (
      <>
        { /* This is the ui specific for this sample.*/}
        <div className="sample-ui">
          <div>
            <span>Use the controls below to change the thematic display attributes.</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/thematic" />
          </div>
          <hr></hr>
          <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
            {this.createThematicDisplayToggle("Thematic Display", "Turn off to see the original model without decorations.")}
            {this.createColorSchemePicker("Color Scheme", "Control the thematic color scheme.")}
            {this.createThematicDisplayRangeSlider("Change Range", "Control the effective area of the thematic display.")}
          </div>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
        {this.getControlPane()}
      </>
    );
  }
}
