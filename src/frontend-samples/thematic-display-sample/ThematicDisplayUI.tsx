/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Range1d, Range1dProps } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ColorDef, ThematicDisplayMode, ThematicDisplayProps, ThematicGradientColorScheme, ThematicGradientMode } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, ScreenViewport, Viewport } from "@bentley/imodeljs-frontend";
import { Select, Slider, Toggle } from "@bentley/ui-core";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import ThematicDisplayApp from "./ThematicDisplayApp";

/** React state of the Sample component */
interface SampleState {
  on: boolean;
  map: boolean;
  range: Range1dProps;
  extents: Range1dProps;
  colorScheme: ThematicGradientColorScheme;
  gradientMode: ThematicGradientMode;
  displayMode: ThematicDisplayMode;
}

/** React props for the Sample component */
interface ThematicDisplaySampleUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

function mapOptions(o: {}): {} {
  const keys = Object.keys(o).filter((key: any) => isNaN(key));
  return Object.assign({}, keys);
}

/** A React component that renders the UI specific for this sample */
export default class ThematicDisplayUI extends React.Component<ThematicDisplaySampleUIProps, SampleState> {

  // defining the Thematic Display Props values that are not what is need at default,
  private static readonly _defaultProps: ThematicDisplayProps = {
    axis: [0.0, 0.0, 1.0],
    gradientSettings: {
      marginColor: ColorDef.white.toJSON(),
      mode: ThematicGradientMode.SteppedWithDelimiter,
      stepCount: 10,
    },
    displayMode: ThematicDisplayMode.Height,
  };

  /** Creates a Sample instance */
  constructor(props?: any) {
    super(props);

    // placeholder state till set based on the view
    this.state = {
      on: false,
      map: false,
      range: [0, 1],
      extents: [0, 1],
      colorScheme: ThematicGradientColorScheme.Custom,
      displayMode: ThematicDisplayMode.Height,
      gradientMode: ThematicGradientMode.SteppedWithDelimiter,
    };
  }

  /** This method is called when the iModel is loaded by the react component */
  private readonly _onIModelReady = (_iModel: IModelConnection) => {
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {
      ThematicDisplayUI.init(vp);
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
    let extents = ThematicDisplayApp.getProjectExtents(vp);
    let range = props.range;

    if (SampleIModels.CoffsHarborDemo === this.props.iModelName)
      extents = [-4.8088836669921875, 127.30888366699219];

    let colorScheme = props.gradientSettings?.colorScheme;
    if (undefined === colorScheme)
      colorScheme = ThematicDisplayUI._defaultProps.gradientSettings!.colorScheme!;

    let displayMode = props.displayMode;
    if (undefined === displayMode)
      displayMode = ThematicDisplayUI._defaultProps.displayMode!;

    let gradientMode = props.gradientSettings?.mode;
    if (undefined === gradientMode)
      gradientMode = ThematicDisplayUI._defaultProps.gradientSettings!.mode!;

    if (ThematicDisplayMode.Slope === displayMode)
      extents = [0, 90]; // Slope range is angular

    if (!Range1d.fromJSON(this.state.extents).isAlmostEqual(Range1d.fromJSON(extents)))
      range = extents;

    this.setState({
      on: ThematicDisplayApp.isThematicDisplayOn(vp),
      map: ThematicDisplayApp.isGeoLocated(vp) && ThematicDisplayApp.isBackgroundMapOn(vp),
      extents: undefined === extents ? [0, 1] : extents,
      range: undefined === range ? [0, 1] : range,
      colorScheme,
      displayMode,
      gradientMode,
    });
  }

  // Handle changes to the thematic display toggle.
  private readonly _onChangeThematicDisplayToggle = (checked: boolean) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    ThematicDisplayApp.setThematicDisplayOnOff(vp, checked);
    this.updateState();
  }

  // Handle changes to the thematic display toggle.
  private readonly _onChangeMapToggle = (checked: boolean) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    ThematicDisplayApp.setBackgroundMap(vp, checked);
    this.updateState();
  }

  // Handles updates to the thematic range slider
  private readonly _onUpdateRangeSlider = (values: readonly number[]) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // This keeps the high and low from crossing
    const newRange = Range1d.createXX(values[0], values[1]);

    ThematicDisplayApp.setThematicDisplayRange(vp, newRange);
    ThematicDisplayApp.syncViewport(vp);
    this.updateState();
  }

  // Handle changes to the display mode.
  private readonly _onChangeColorScheme = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const colorScheme: ThematicGradientColorScheme = Number.parseInt(event.target.value, 10);

    ThematicDisplayApp.setThematicDisplayGradientColorScheme(vp, colorScheme);
    ThematicDisplayApp.syncViewport(vp);
    this.updateState();
  }

  // Handle changes to the gradient mode.
  private readonly _onChangeGradientMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const gradientMode: ThematicGradientMode = Number.parseInt(event.target.value, 10);

    ThematicDisplayApp.setThematicDisplayGradientMode(vp, gradientMode);
    ThematicDisplayApp.syncViewport(vp);
    this.updateState();
  }

  // Handle changes to the display mode.
  private readonly _onChangeDisplayMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const displayMode: ThematicDisplayMode = Number.parseInt(event.target.value, 10);

    ThematicDisplayApp.setThematicDisplayMode(vp, displayMode);
    ThematicDisplayApp.syncViewport(vp);
    this.updateState();
  }

  /** Components for rendering the sample's instructions and controls */
  public getControls() {

    const colorSchemeOptions = mapOptions(ThematicGradientColorScheme);
    delete (colorSchemeOptions as any)[ThematicGradientColorScheme.Custom]; // Custom options are not supported for this sample.

    const gradientModeOptions = mapOptions(ThematicGradientMode);

    const displayModeOptions = mapOptions(ThematicDisplayMode);
    delete (displayModeOptions as any)[ThematicDisplayMode.InverseDistanceWeightedSensors]; // Sensors are not supported for this sample.
    // A sensor specific sample will come soon.

    const vp = IModelApp.viewManager.selectedView;
    const isGeoLocated = vp ? ThematicDisplayApp.isGeoLocated(vp) : false;

    const isRangeDisabled = this.state.displayMode === ThematicDisplayMode.HillShade;

    const extents = Range1d.fromJSON(this.state.extents);
    const min = extents.low, max = extents.high;
    const range = Range1d.fromJSON(this.state.range);
    const step = 1;

    return (
      <>
        { /* This is the ui specific for this sample.*/}
        <div className="sample-options-2col">
          <label>Thematic Display</label>
          <Toggle isOn={this.state.on} onChange={this._onChangeThematicDisplayToggle} />

          <label>Background Map</label>
          <Toggle isOn={this.state.map} onChange={this._onChangeMapToggle} disabled={!isGeoLocated}/>

          <label>Display Mode</label>
          <Select style={{ width: "fit-content" }} onChange={this._onChangeDisplayMode} value={this.state.displayMode} options={displayModeOptions} />

          <label>Color Scheme</label>
          <Select style={{ width: "fit-content" }} onChange={this._onChangeColorScheme} value={this.state.colorScheme} options={colorSchemeOptions} />

          <label>Gradient Mode</label>
          <Select style={{width: "fit-content"}} onChange={this._onChangeGradientMode} value={this.state.gradientMode} options={gradientModeOptions} disabled={this.state.displayMode === ThematicDisplayMode.HillShade} />

          <label>Change Range</label>
          <span style={{display: "flex"}}>
            <label style={{ marginRight: 7 }}>{Math.round(min)}</label>
            <Slider min={min} max={max} step={step} values={[range.low, range.high]} onUpdate={this._onUpdateRangeSlider} disabled={isRangeDisabled} />
            <label style={{ marginLeft: 7 }}>{Math.round(max)}</label>
          </span>
        </div>
      </>
    );
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Use the controls below to change the thematic display attributes." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
      </>
    );
  }
}
