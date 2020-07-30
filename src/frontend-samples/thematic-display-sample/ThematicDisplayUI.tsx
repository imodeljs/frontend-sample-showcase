/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Range1d, Range1dProps } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ColorDef, ThematicDisplayProps, ThematicGradientColorScheme } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import { Slider, Toggle } from "@bentley/ui-core";
import * as React from "react";
import { ReloadableViewport } from "../../Components/Viewport/ReloadableViewport";
import ThematicDisplayApp from "./ThematicDisplayApp";

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
  setupControlPane: (instructions: string, controls?: React.ReactNode) => void;
}

/** A React component that renders the UI specific for this sample */
export default class ThematicDisplaySampleUIComponent extends React.Component<ThematicDisplaySampleUIProps, SampleState> {

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
    if (undefined === vp || !ThematicDisplayApp.isThematicDisplaySupported(vp)) {
      alert("iModel is not compatible with thematic display, please use an iModel with a 3d view.");
      return;
    }

    // Set the default values.
    ThematicDisplayApp.setThematicDisplayProps(vp, this._defaultProps);

    // Will enable Thematic Display over the whole iModel.
    const extents = ThematicDisplayApp.getProjectExtents(vp);
    ThematicDisplayApp.setThematicDisplayRange(vp, extents);

    // Redraw viewport with new settings
    ThematicDisplayApp.syncViewport(vp);

    // Turn on
    // Note: Since this function is modifying the view flags, the view does not need to be synced to see the changes.
    ThematicDisplayApp.setThematicDisplayOnOff(vp, true);
  }

  /** Update the state of the sample react component by querying the API. */
  public updateState() {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    const props = ThematicDisplayApp.getThematicDisplayProps(vp);
    const extents = ThematicDisplayApp.getProjectExtents(vp);
    const range = props.range;

    let colorScheme = props.gradientSettings?.colorScheme;
    if (undefined === colorScheme)
      colorScheme = ThematicGradientColorScheme.BlueRed;

    this.setState({
      on: ThematicDisplayApp.isThematicDisplayOn(vp),
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

    ThematicDisplayApp.setThematicDisplayOnOff(vp, checked);
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

    ThematicDisplayApp.setThematicDisplayRange(vp, newRange);
    ThematicDisplayApp.syncViewport(vp);
    this.updateState();
  }

  // Create a component for controlling the range the thematic display
  private createThematicDisplayRangeSlider(label: string, info: string) {
    const extents = Range1d.fromJSON(this.state.extents);
    const range = Range1d.fromJSON(this.state.range);

    const step = 1;
    const element = <Slider min={extents.low} max={extents.high} step={step}
      values={[range.low, range.high]} onUpdate={this._onUpdateRangeSlider} />;

    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handle changes to the display mode.
  private _onChangeColorScheme = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const colorScheme: ThematicGradientColorScheme = Number.parseInt(event.target.value, 10);

    ThematicDisplayApp.setThematicDisplayGradientColorScheme(vp, colorScheme);
    ThematicDisplayApp.syncViewport(vp);
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
  public getControls() {
    return (
      <>
        { /* This is the ui specific for this sample.*/}
        <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {this.createThematicDisplayToggle("Thematic Display", "Turn off to see the original model without decorations.")}
          {this.createColorSchemePicker("Color Scheme", "Control the thematic color scheme.")}
          {this.createThematicDisplayRangeSlider("Change Range", "Control the effective area of the thematic display.")}
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    this.props.setupControlPane("Use the controls below to change the thematic display attributes.", this.getControls());
    return (
      <>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
      </>
    );
  }
}
