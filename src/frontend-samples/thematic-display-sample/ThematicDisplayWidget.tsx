/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Select, Slider, Toggle } from "@itwin/core-react";
import { IModelApp, ScreenViewport } from "@itwin/core-frontend";
import { calculateSolarDirectionFromAngles, ColorDef, ThematicDisplayMode, ThematicDisplayProps, ThematicGradientColorScheme, ThematicGradientMode } from "@itwin/core-common";
import { Range1d, Range1dProps } from "@itwin/core-geometry";
import ThematicDisplayApi from "./ThematicDisplayApi";
import "./ThematicDisplay.scss";

// defining the Thematic Display Props values that are not what is need at default,
const _defaultAzimuth = 315.0;
const _defaultElevation = 45.0;
const _defaultProps: ThematicDisplayProps = {
  axis: [0.0, 0.0, 1.0],
  gradientSettings: {
    colorScheme: ThematicGradientColorScheme.BlueRed,
    marginColor: ColorDef.white.toJSON(),
    mode: ThematicGradientMode.SteppedWithDelimiter,
    stepCount: 10,
  },
  sunDirection: calculateSolarDirectionFromAngles({ azimuth: _defaultAzimuth, elevation: _defaultElevation }),
  displayMode: ThematicDisplayMode.Height,
};

const ThematicDisplayWidget: React.FunctionComponent = () => {

  const iModelConnection = useActiveIModelConnection();
  const viewport = IModelApp.viewManager.selectedView;
  const [onState, setOnState] = React.useState<boolean>(false);
  const [mapState, setMapState] = React.useState<boolean>(false);
  const [rangeState, setRangeState] = React.useState<Range1dProps>([0, 1]);
  const [extentsState, setExtentsState] = React.useState<Range1dProps>([0, 1]);
  const [colorSchemeState, setColorSchemeState] = React.useState<ThematicGradientColorScheme>(ThematicGradientColorScheme.BlueRed);
  const [gradientModeState, setGradientModeState] = React.useState<ThematicGradientMode>(ThematicGradientMode.SteppedWithDelimiter);
  const [displayModeState, setDisplayModeState] = React.useState<ThematicDisplayMode>(ThematicDisplayMode.Height);
  const [azimuthState, setAzimuthState] = React.useState<number>(_defaultAzimuth);
  const [elevationState, setElevationState] = React.useState<number>(_defaultElevation);

  useEffect(() => {
    if (viewport) {
      initViewport(viewport);
      updateState();
    } else {
      IModelApp.viewManager.onViewOpen.addOnce((vp: ScreenViewport) => {
        initViewport(vp);
        updateState();
      });
    }

    return () => {
      if (undefined === ThematicDisplayApi.viewport)
        return;
      ThematicDisplayApi.setThematicDisplayProps(ThematicDisplayApi.viewport, ThematicDisplayApi.originalProps);
      ThematicDisplayApi.setThematicDisplayOnOff(ThematicDisplayApi.viewport, ThematicDisplayApi.originalFlag);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!viewport)
      return;
    ThematicDisplayApi.setThematicDisplaySunDirection(viewport, calculateSolarDirectionFromAngles({ azimuth: azimuthState, elevation: elevationState }));
    ThematicDisplayApi.syncViewport(viewport);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [azimuthState, elevationState]);

  /** This method should be called when the iModel is loaded to set default settings in the
   * viewport settings to enable thematic display.
   */
  const initViewport = (vp: ScreenViewport) => {
    // Test that view is compatible with thematic display.
    if (undefined === vp || !ThematicDisplayApi.isThematicDisplaySupported(vp)) {
      alert("iModel is not compatible with thematic display, please use an iModel with a 3d view.");
      return;
    }
    // Set the default values.
    ThematicDisplayApi.setThematicDisplayProps(vp, _defaultProps);

    // Will enable Thematic Display over the whole iModel.
    const extents = ThematicDisplayApi.getProjectExtents(vp);
    ThematicDisplayApi.setThematicDisplayRange(vp, extents);

    // Redraw viewport with new settings
    ThematicDisplayApi.syncViewport(vp);

    if (vp.viewFlags.backgroundMap)
      ThematicDisplayApi.setBackgroundMap(vp, true); // this also enables the terrain.

    // Turn on
    // Note: Since this function is modifying the view flags, the view does not need to be synced to see the changes.
    ThematicDisplayApi.setThematicDisplayOnOff(vp, true);
  };

  /** Update the state of the sample react component by querying the API. */
  const updateState = () => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    const props = ThematicDisplayApi.getThematicDisplayProps(vp);
    let extents = ThematicDisplayApi.getProjectExtents(vp);
    let range = props.range;

    // The coff harbors sample
    if ("CoffsHarborDemo" === iModelConnection?.name)
      extents = [-4.8088836669921875, 127.30888366699219];

    let colorScheme = props.gradientSettings?.colorScheme;
    if (undefined === colorScheme)
      colorScheme = _defaultProps.gradientSettings!.colorScheme!;

    let displayMode = props.displayMode;
    if (undefined === displayMode)
      displayMode = _defaultProps.displayMode!;

    let gradientMode = props.gradientSettings?.mode;
    if (undefined === gradientMode)
      gradientMode = _defaultProps.gradientSettings!.mode!;

    if (ThematicDisplayMode.Slope === displayMode)
      extents = [0, 90]; // Slope range is angular

    if (!Range1d.fromJSON(extents).isAlmostEqual(Range1d.fromJSON(extents)))
      range = extents;

    setOnState(ThematicDisplayApi.isThematicDisplayOn(vp));
    setMapState(ThematicDisplayApi.isGeoLocated(vp) && ThematicDisplayApi.isBackgroundMapOn(vp));
    setExtentsState(undefined === extents ? [0, 1] : extents);
    setRangeState(undefined === range ? [0, 1] : range);
    setColorSchemeState(colorScheme);
    setDisplayModeState(displayMode);
    setGradientModeState(gradientMode);
  };

  // Handle changes to the thematic display toggle.
  const _onChangeThematicDisplayToggle = (checked: boolean) => {
    if (undefined === viewport)
      return;

    ThematicDisplayApi.setThematicDisplayOnOff(viewport, checked);
    updateState();
  };

  // Handle changes to the thematic display toggle.
  const _onChangeMapToggle = (checked: boolean) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    ThematicDisplayApi.setBackgroundMap(vp, checked);
    updateState();
  };

  // Handle changes to the display mode.
  const _onChangeDisplayMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const displayMode: ThematicDisplayMode = Number.parseInt(event.target.value, 10);

    ThematicDisplayApi.setThematicDisplayMode(vp, displayMode);
    ThematicDisplayApi.syncViewport(vp);
    updateState();
  };

  // Handle changes to the display mode.
  const _onChangeColorScheme = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const colorScheme: ThematicGradientColorScheme = Number.parseInt(event.target.value, 10);

    ThematicDisplayApi.setThematicDisplayGradientColorScheme(vp, colorScheme);
    ThematicDisplayApi.syncViewport(vp);
    updateState();
  };

  // Handle changes to the gradient mode.
  const _onChangeGradientMode = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // Convert the value back to number represented by enum.
    const gradientMode: ThematicGradientMode = Number.parseInt(event.target.value, 10);

    ThematicDisplayApi.setThematicDisplayGradientMode(vp, gradientMode);
    ThematicDisplayApi.syncViewport(vp);
    updateState();
  };

  // Handles updates to the thematic range slider
  const _onUpdateRangeSlider = (values: readonly number[]) => {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    // This keeps the high and low from crossing
    const newRange = Range1d.createXX(values[0], values[1]);

    ThematicDisplayApi.setThematicDisplayRange(vp, newRange);
    ThematicDisplayApi.syncViewport(vp);
    updateState();
  };

  const _mapOptions = (o: {}): {} => {
    const keys = Object.keys(o).filter((key: any) => isNaN(key));
    return keys.map((label, index) => {
      return { label, value: index, disabled: false };
    });
  };

  const colorSchemeOptions = _mapOptions(ThematicGradientColorScheme);
  delete (colorSchemeOptions as any)[ThematicGradientColorScheme.Custom]; // Custom colors are not supported for this sample.

  const gradientModeOptions = _mapOptions(ThematicGradientMode);
  if (displayModeState !== ThematicDisplayMode.Height) {
    (gradientModeOptions as any)[ThematicGradientMode.IsoLines].disabled = true;
    (gradientModeOptions as any)[ThematicGradientMode.SteppedWithDelimiter].disabled = true;
  }

  const displayModeOptions = _mapOptions(ThematicDisplayMode);
  delete (displayModeOptions as any)[ThematicDisplayMode.InverseDistanceWeightedSensors]; // Sensors are not supported for this sample.
  // A sensor specific sample will come soon.
  const isGeoLocated = viewport ? ThematicDisplayApi.isGeoLocated(viewport) : false;

  const ext = Range1d.fromJSON(extentsState);
  const min = ext.low, max = ext.high;
  const sliderRange = Range1d.fromJSON(rangeState);
  const step = 1;

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-options-2col">
        <label>Thematic Display</label>
        <Toggle isOn={onState} onChange={_onChangeThematicDisplayToggle} />

        <label>Background Map</label>
        <Toggle isOn={mapState} onChange={_onChangeMapToggle} disabled={!isGeoLocated} />

        <label>Display Mode</label>
        <Select style={{ width: "fit-content" }} onChange={_onChangeDisplayMode} value={displayModeState.toString()} options={displayModeOptions} />

        <label>Color Scheme</label>
        <Select style={{ width: "fit-content" }} onChange={_onChangeColorScheme} value={colorSchemeState.toString()} options={colorSchemeOptions} />

        <label>Gradient Mode</label>
        <Select style={{ width: "fit-content" }} onChange={_onChangeGradientMode} value={gradientModeState.toString()} options={gradientModeOptions} />

        <label>Change Range</label>
        {displayModeState !== ThematicDisplayMode.HillShade ?
          <span style={{ display: "flex", flexDirection: "row" }}>
            <label style={{ marginRight: 7 }}>{Math.round(min)}</label>
            <Slider min={min} max={max} step={step} values={[sliderRange.low, sliderRange.high]} onUpdate={_onUpdateRangeSlider} />
            <label style={{ marginLeft: 7 }}>{Math.round(max)}</label>
          </span> : <span style={{ display: "flex", flexDirection: "column" }}>
            <span style={{ display: "flex", flexDirection: "row" }}>
              <label style={{ marginRight: 7 }}>Azimuth</label>
              <Slider min={0} max={360} step={1} values={[azimuthState]} onUpdate={(values) => setAzimuthState(values[0])} />
            </span>
            <span style={{ display: "flex", flexDirection: "row" }}>
              <label style={{ marginRight: 7 }}>Elevation</label>
              <Slider min={0} max={90} step={1} values={[elevationState]} onUpdate={(values) => setElevationState(values[0])} />
            </span>
          </span>}
      </div>
    </div>
  );
};

export class ThematicDisplayWidgetProvider implements UiItemsProvider {
  public readonly id: string = "ThematicDisplayWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ThematicDisplayWidget",
          label: "Thematic Display Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <ThematicDisplayWidget />,
        }
      );
    }
    return widgets;
  }
}
