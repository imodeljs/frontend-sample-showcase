/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Range1d, Range1dProps, Range3d, Range3dProps } from "@bentley/geometry-core";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { ColorDef, ThematicDisplayMode, ThematicDisplayProps, ThematicGradientColorScheme, ThematicGradientMode } from "@bentley/imodeljs-common";
import { IModelApp, IModelConnection, ScreenViewport, Viewport, ViewState } from "@bentley/imodeljs-frontend";
import { Slider, Toggle } from "@bentley/ui-core";
import { ControlPane } from "Components/ControlPane/ControlPane";
import { ReloadableViewport } from "Components/Viewport/ReloadableViewport";
import * as React from "react";
import ThematicModesApp from "./ThematicModesApp";
import { ViewSetup } from "api/viewSetup";
import { SampleIModels } from "Components/IModelSelector/IModelSelector";
import { ShowcaseViewSelector } from "./ThematicModes";
import { SampleGridBuilder } from "frontend-samples/heatmap-decorator-sample/HeatmapDecorator";
// import { ViewSelector } from "@bentley/ui-framework";

/** React state of the Sample component */
interface ThematicModesUIState {
  on: boolean;
  range: Range1dProps;
  extents: Range1dProps;
  colorScheme: ThematicGradientColorScheme;
  gradientMode: ThematicGradientMode;
  displayMode: ThematicDisplayMode;
  viewList: IModelConnection.ViewSpec[];
  iModel?: IModelConnection;
}

/** React props for the Sample component */
interface ThematicModesUIProps {
  iModelName: string;
  iModelSelector: React.ReactNode;
}

/** A React component that renders the UI specific for this sample */
export default class ThematicModesUI extends React.Component<ThematicModesUIProps, ThematicModesUIState> {

  private _grid?: SampleGridBuilder;
  private _points: Range3d[] = [];

  // defining the Thematic Display Props values that are not what is need at default,
  private static readonly _defaultProps: ThematicDisplayProps = {
    axis: [0.0, 0.0, 1.0],
    gradientSettings: {
      marginColor: ColorDef.white.toJSON(),
      mode: ThematicGradientMode.SteppedWithDelimiter,
    },
    displayMode: ThematicDisplayMode.Height,
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
      displayMode: ThematicDisplayMode.Height,
      gradientMode: ThematicGradientMode.SteppedWithDelimiter,
      viewList: [],
    };
  }

  /** This method is called when the iModel is loaded by the react component */
  private readonly _onIModelReady = (iModel: IModelConnection) => {
    this.setState({ iModel });
    IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {
      ThematicModesUI.init(vp);
      this.updateState();
    });
  }

  /** This method should be called when the iModel is loaded to set default settings in the
   * viewport settings to enable thematic display.
   */
  public static init(vp: Viewport) {
    // Test that view is compatible with thematic display.
    if (undefined === vp || !ThematicModesApp.isThematicDisplaySupported(vp)) {
      alert("iModel is not compatible with thematic display, please use an iModel with a 3d view.");
      return;
    }

    // Set the default values.
    ThematicModesApp.setThematicDisplayProps(vp, this._defaultProps);

    // Will enable Thematic Display over the whole iModel.
    const extents = ThematicModesApp.getProjectExtents(vp);
    const highLow: Range1dProps = { low: extents.zLow, high: extents.zHigh };
    ThematicModesApp.setThematicDisplayRange(vp, highLow);

    // Redraw viewport with new settings
    ThematicModesApp.syncViewport(vp);

    // Turn on
    // Note: Since this function is modifying the view flags, the view does not need to be synced to see the changes.
    ThematicModesApp.setThematicDisplayOnOff(vp, true);
  }

  /** Update the state of the sample react component by querying the API. */
  public updateState() {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    const props = ThematicModesApp.getThematicDisplayProps(vp);
    const projectExtents = ThematicModesApp.getProjectExtents(vp);
    let extents: Range1dProps = { low: projectExtents.zLow, high: projectExtents.zHigh };
    const range = props.range;
    if (this.props.iModelName === SampleIModels.CoffsHarborDemo)
      extents = [-4.8088836669921875, 127.30888366699219];

    let colorScheme = props.gradientSettings?.colorScheme;
    if (undefined === colorScheme)
      colorScheme = ThematicGradientColorScheme.BlueRed;

    let displayMode = props.displayMode;
    if (undefined === displayMode)
      displayMode = ThematicModesUI._defaultProps.displayMode!;

    let gradientMode = props.gradientSettings?.mode;
    if (undefined === gradientMode)
      gradientMode = ThematicModesUI._defaultProps.gradientSettings!.mode!;

    this.setState({
      on: ThematicModesApp.isThematicDisplayOn(vp),
      extents: undefined === extents ? [0, 1] : extents,
      range: undefined === range ? [0, 1] : range,
      colorScheme,
      displayMode,
      gradientMode,
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
  private readonly _onChangeThematicDisplayToggle = (checked: boolean) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    ThematicModesApp.setThematicDisplayOnOff(vp, checked);
    this.updateState();
  }

  // Creates the react components for the thematic display toggle row.
  private createThematicDisplayToggle(label: string, info: string) {
    const element = <Toggle isOn={this.state.on} onChange={this._onChangeThematicDisplayToggle} />;
    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handles updates to the thematic range slider
  private readonly _onUpdateRangeSlider = (values: readonly number[]) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // This keeps the high and low from crossing
    const newRange = Range1d.createXX(values[0], values[1]);

    ThematicModesApp.setThematicDisplayRange(vp, newRange);
    ThematicModesApp.syncViewport(vp);
    this.updateState();
  }

  // Create a component for controlling the range the thematic display
  private createThematicDisplayRangeSlider(label: string, info: string) {
    const extents = Range1d.fromJSON(this.state.extents);
    const range = Range1d.fromJSON(this.state.range);

    const step = 1;
    const element = <Slider min={extents.low} max={extents.high} step={step}
      disabled={this.state.displayMode === ThematicDisplayMode.HillShade}
      values={[range.low, range.high]} onUpdate={this._onUpdateRangeSlider} />;

    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handle changes to the display mode.
  private readonly _onChangeColorScheme = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const colorScheme: ThematicGradientColorScheme = Number.parseInt(event.target.value, 10);

    ThematicModesApp.setThematicDisplayGradientColorScheme(vp, colorScheme);
    ThematicModesApp.syncViewport(vp);
    this.updateState();
  }

  // Create the react components for the render mode row.
  private createColorSchemePicker(label: string, info: string) {
    const element =
      <select style={{ width: "fit-content" }}
        disabled={this.state.displayMode === ThematicDisplayMode.InverseDistanceWeightedSensors}
        onChange={this._onChangeColorScheme}
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

  // Handle changes to the display mode.
  private readonly _onChangeDisplayMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const displayMode: ThematicDisplayMode = Number.parseInt(event.target.value, 10);

    ThematicModesApp.setThematicDisplayMode(vp, displayMode);
    ThematicModesApp.syncViewport(vp);
    this.updateState();
  }

  // Create the react components for the display mode row.
  private createDisplayModePicker(label: string, info: string) {
    const element =
      <select style={{ width: "fit-content" }} onChange={this._onChangeDisplayMode}
        value={this.state.displayMode}>
        <option value={ThematicDisplayMode.Height}> Height </option>
        <option value={ThematicDisplayMode.HillShade}> Hill Shade </option>
        <option value={ThematicDisplayMode.InverseDistanceWeightedSensors}> Sensors </option>
        <option value={ThematicDisplayMode.Slope}> Sea Mountain </option>
      </select>;

    return this.createJSXElementForAttribute(label, info, element);
  }

  // Handle changes to the display mode.
  private readonly _onChangeGradientMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const gradientMode: ThematicGradientMode = Number.parseInt(event.target.value, 10);

    ThematicModesApp.setThematicDisplayGradientMode(vp, gradientMode);
    ThematicModesApp.syncViewport(vp);
    this.updateState();
  }

  // Create the react components for the display mode row.
  private createGradientModePicker(label: string, info: string) {
    const element =
      <select style={{ width: "fit-content" }}
        disabled={this.state.displayMode === ThematicDisplayMode.HillShade}
        onChange={this._onChangeGradientMode}
        value={this.state.gradientMode}>
        <option value={ThematicGradientMode.Smooth}> Smooth </option>
        <option value={ThematicGradientMode.Stepped}> Stepped </option>
        <option value={ThematicGradientMode.SteppedWithDelimiter}> Stepped With Delimiter </option>
        <option value={ThematicGradientMode.IsoLines}> Isolated Line </option>
      </select>;

    return this.createJSXElementForAttribute(label, info, element);
  }

  public getViewSelector(): React.ReactNode {
    const activeViewId = IModelApp.viewManager.selectedView?.view.id;
    let viewSelector: React.ReactNode = <></>;
    if (undefined !== activeViewId && this.state.viewList.length > 0)
      viewSelector = (
        <select value={activeViewId} onChange={async (event) => {
          const iModel = IModelApp.viewManager.selectedView!.iModel;
          const state = await iModel.views.load(event.target.value);
          IModelApp.viewManager.selectedView?.changeView(state);
          this.updateState();
        }}>
          {this.state.viewList.map((viewSpec, index) =>
            <option key={index} value={viewSpec.id}>{viewSpec.name}</option>)}
        </select>
      );
    return viewSelector;
  }

  /** Components for rendering the sample's instructions and controls */
  public getControls() {
    return (
      <>
        { /* This is the ui specific for this sample.*/}
        {/* {this.getViewSelector()} */}
        <ShowcaseViewSelector imodel={this.state.iModel} queryParams={{ wantPrivate: false }}></ShowcaseViewSelector>
        {/* <ViewSelector imodel={this.state.iModel} listenForShowUpdates={true} showUnknown={true} showSpatials={true}></ViewSelector> */}
        <div className="sample-options-2col" style={{ gridTemplateColumns: "1fr 1fr" }}>
          {this.createThematicDisplayToggle("Thematic Display", "Turn off to see the original model without decorations.")}
          {this.createDisplayModePicker("Display Mode", "Control the thematic mode displayed.")}
          {this.createColorSchemePicker("Color Scheme", "Control the thematic color scheme.")}
          {this.createGradientModePicker("Gradient Mode", "Control the gradient of the thematic display.")}
          {this.createThematicDisplayRangeSlider("Change Range", "Control the effective area of the thematic display.")}
        </div>
      </>
    );
  }

  private readonly _getCoffsHarbourView = async (imodel: IModelConnection): Promise<ViewState> => {
    const viewList = await imodel.views.getViewList({ wantPrivate: false });
    // console.debug(viewList);
    // imodel.views.load();
    this.setState({ viewList });
    return ViewSetup.getDefaultView(imodel);
  }

  public componentDidUpdate(_prevProps: ThematicModesUIProps, _prevState: ThematicModesUIState) {
    if (this.state.displayMode === ThematicDisplayMode.InverseDistanceWeightedSensors) {
      const vp = IModelApp.viewManager.selectedView;
      const gridSize = 12;
      if (undefined === this._grid && undefined !== vp) {
        const range: Range1dProps = this.state.range;
        const extents: Range3d = ThematicModesApp.getProjectExtents(vp);
        extents!.low.z = (range as number[])[0];
        extents!.high.z = (range as number[])[1];
        this._grid = new SampleGridBuilder(extents, gridSize);
      } // Grid setup
    //   if (undefined !== this._grid)
    //     this._grid.
    }
  }

  /** The sample's render method */
  public render() {
    return (
      <>
        <ControlPane instructions="Use the controls below to change the thematic display attributes." controls={this.getControls()} iModelSelector={this.props.iModelSelector}></ControlPane>
        <ReloadableViewport getCustomViewState={this._getCoffsHarbourView} iModelName={this.props.iModelName} onIModelReady={this._onIModelReady} />
      </>
    );
  }
}
