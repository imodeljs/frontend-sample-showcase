/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { useActiveViewport } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Viewport } from "@itwin/core-frontend";
import { calculateSolarDirectionFromAngles, ColorDef, ThematicDisplayMode, ThematicDisplayProps, ThematicGradientColorScheme, ThematicGradientMode } from "@itwin/core-common";
import { Range1d, Range1dProps } from "@itwin/core-geometry";
import ThematicDisplayApi from "./ThematicDisplayApi";
import "./ThematicDisplay.scss";
import { Alert, Label, Select, SelectOption, Slider, ToggleSwitch } from "@itwin/itwinui-react";

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

  // const iModelConnection = useActiveIModelConnection();
  const viewport = useActiveViewport();
  const [onState, setOnState] = React.useState<boolean>(false);
  const [mapState, setMapState] = React.useState<boolean>(false);
  const [rangeState, setRangeState] = React.useState<Range1dProps>([0, 1]);
  const [extentsState, setExtentsState] = React.useState<Range1dProps>([0, 1]);
  const [colorSchemeState, setColorSchemeState] = React.useState<ThematicGradientColorScheme>(ThematicGradientColorScheme.BlueRed);
  const [gradientModeState, setGradientModeState] = React.useState<ThematicGradientMode>(ThematicGradientMode.SteppedWithDelimiter);
  const [displayModeState, setDisplayModeState] = React.useState<ThematicDisplayMode>(ThematicDisplayMode.Height);
  const [azimuthState, setAzimuthState] = React.useState<number>(_defaultAzimuth);
  const [elevationState, setElevationState] = React.useState<number>(_defaultElevation);

  // Will prepare the view to show Thematic Display
  useEffect(() => {
    if (!viewport) return;
    const vp = viewport;
    // Test that view is compatible with thematic display.
    if (!ThematicDisplayApi.isThematicDisplaySupported(vp)) {
      alert("iModel is not compatible with thematic display, please use an iModel with a 3d view.");
      return;
    }
    // Set the default values.
    ThematicDisplayApi.setThematicDisplayProps(vp, _defaultProps);

    // Will enable Thematic Display over the whole iModel.
    let extents = ThematicDisplayApi.getProjectExtents(vp.iModel);
    if ("CoffsHarborDemo" === vp.iModel?.name)
      extents = [-4.8088836669921875, 127.30888366699219];
    ThematicDisplayApi.setThematicDisplayRange(vp, extents);

    // Redraw viewport with new settings
    ThematicDisplayApi.syncViewport(vp);

    if (vp.viewFlags.backgroundMap)
      ThematicDisplayApi.setBackgroundMap(vp, true); // this also enables the terrain.

    // Turn on
    // Note: Since this function is modifying the view flags, the view does not need to be synced to see the changes.
    ThematicDisplayApi.setThematicDisplayOnOff(vp, true);

    const props = ThematicDisplayApi.getThematicDisplayProps(vp);
    const viewFlags = vp.viewFlags;
    updateState(vp, props, viewFlags.thematicDisplay, viewFlags.backgroundMap);
    const unsubThematicUpdate = viewport.view.displayStyle.settings.onThematicChanged.addListener((newThematic) => {
      const newProps = newThematic.toJSON();
      const newFlags = vp.viewFlags;
      updateState(vp, newProps, newFlags.thematicDisplay, newFlags.backgroundMap);
    });
    const unsubViewFlagUpdate = viewport.view.displayStyle.settings.onViewFlagsChanged.addListener((newFlags) => {
      const newProps = ThematicDisplayApi.getThematicDisplayProps(vp);
      updateState(vp, newProps, newFlags.thematicDisplay, newFlags.backgroundMap);
    });
    return () => {
      unsubThematicUpdate();
      unsubViewFlagUpdate();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewport]);

  useEffect(() => {
    if (!viewport) return;
    ThematicDisplayApi.setThematicDisplaySunDirection(viewport, calculateSolarDirectionFromAngles({ azimuth: azimuthState, elevation: elevationState }));
    ThematicDisplayApi.syncViewport(viewport);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [azimuthState, elevationState]);

  /** Update the state of the sample react component by querying the API. */
  const updateState = (vp: Viewport, props: ThematicDisplayProps, isThematicDisplayOn: boolean, isBackgroundMapOn: boolean) => {
    let extents = ThematicDisplayApi.getProjectExtents(vp.iModel);
    let range = props.range;

    // The coff harbors sample
    if ("CoffsHarborDemo" === vp.iModel?.name)
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

    range = range ? capRange(range, extents) : extents;
    // if (!Range1d.fromJSON(extents).isAlmostEqual(Range1d.fromJSON(extents)))
    //   range = extents;

    setOnState(isThematicDisplayOn);
    setMapState(ThematicDisplayApi.isGeoLocated(vp.iModel) && isBackgroundMapOn);
    setExtentsState(undefined === extents ? [0, 1] : extents);
    setRangeState(undefined === range ? [0, 1] : range);
    setColorSchemeState(colorScheme);
    setDisplayModeState(displayMode);
    setGradientModeState(gradientMode);
  };

  const capRange = (range: Range1dProps, capProps: Range1dProps): Range1dProps => {
    const val = Range1d.fromJSON(range), cap = Range1d.fromJSON(capProps);
    range = [Math.max(cap.low, val.low), Math.min(cap.high, val.high)];
    return range;
  };

  // Handle changes to the thematic display toggle.
  const _onChangeThematicDisplayToggle = (checked: boolean) => {
    if (undefined === viewport)
      return;

    ThematicDisplayApi.setThematicDisplayOnOff(viewport, checked);
  };

  // Handle changes to the thematic display toggle.
  const _onChangeMapToggle = (checked: boolean) => {
    if (undefined === viewport)
      return;

    ThematicDisplayApi.setBackgroundMap(viewport, checked);
  };

  // Handle changes to the display mode.
  const _onChangeDisplayMode = (num: number) => {
    if (undefined === viewport)
      return;

    // Convert the value back to number represented by enum.
    const displayMode: ThematicDisplayMode = num;

    ThematicDisplayApi.setThematicDisplayMode(viewport, displayMode);
    ThematicDisplayApi.syncViewport(viewport);
  };

  // Handle changes to the display mode.
  const _onChangeColorScheme = (num: number) => {
    if (undefined === viewport)
      return;

    // Convert the value back to number represented by enum.
    const colorScheme: ThematicGradientColorScheme = num;

    ThematicDisplayApi.setThematicDisplayGradientColorScheme(viewport, colorScheme);
    ThematicDisplayApi.syncViewport(viewport);
  };

  // Handle changes to the gradient mode.
  const _onChangeGradientMode = (num: number) => {
    if (undefined === viewport)
      return;

    // Convert the value back to number represented by enum.
    const gradientMode: ThematicGradientMode = num;

    ThematicDisplayApi.setThematicDisplayGradientMode(viewport, gradientMode);
    ThematicDisplayApi.syncViewport(viewport);
  };

  // Handles updates to the thematic range slider
  const _onUpdateRangeSlider = (values: readonly number[]) => {
    if (undefined === viewport)
      return;

    // This keeps the high and low from crossing
    const newRange = Range1d.createXX(values[0], values[1]);

    ThematicDisplayApi.setThematicDisplayRange(viewport, newRange);
    ThematicDisplayApi.syncViewport(viewport);
  };

  const _mapOptions = (o: {}): SelectOption<number>[] => {
    const keys = Object.keys(o).filter((key: any) => isNaN(key));
    return keys.map((label, index) => {
      return { label, value: index, disabled: false };
    });
  };

  const colorSchemeOptions = _mapOptions(ThematicGradientColorScheme);
  (colorSchemeOptions as any)[ThematicGradientColorScheme.Custom].disabled = true; // Custom colors are not supported for this sample.

  const gradientModeOptions = _mapOptions(ThematicGradientMode);
  if (displayModeState !== ThematicDisplayMode.Height) {
    (gradientModeOptions as any)[ThematicGradientMode.IsoLines].disabled = true;
    (gradientModeOptions as any)[ThematicGradientMode.SteppedWithDelimiter].disabled = true;
  }

  const displayModeOptions = _mapOptions(ThematicDisplayMode);
  delete (displayModeOptions as any)[ThematicDisplayMode.InverseDistanceWeightedSensors]; // Sensors are not supported for this sample.
  // A sensor specific sample will come soon.
  const isGeoLocated = viewport ? ThematicDisplayApi.isGeoLocated(viewport.iModel) : false;

  const ext = Range1d.fromJSON(extentsState);
  const min = ext.low, max = ext.high;
  const sliderRange = Range1d.fromJSON(rangeState);
  const step = 1;

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-grid">
        <div className="sample-grid-toggles">
          <ToggleSwitch label="Thematic Display" checked={onState} onChange={(e) => _onChangeThematicDisplayToggle(e.target.checked)} />
          <ToggleSwitch label="Background Map" checked={mapState} onChange={(e) => _onChangeMapToggle(e.target.checked)} disabled={!isGeoLocated} />
        </div>
        <div className="sample-grid-selects">
          <Label htmlFor="display-mode">Display Mode</Label>
          <Select<number> id="display-mode" size="small" onChange={_onChangeDisplayMode} value={displayModeState} options={displayModeOptions} />
          <Label htmlFor="color-scheme">Color Scheme</Label>
          <Select<number> id="color-scheme" size="small" onChange={_onChangeColorScheme} value={colorSchemeState} options={colorSchemeOptions} />
          <Label htmlFor="gradient-mode">Gradient Mode</Label>
          <Select<number> id="gradient-mode" size="small" onChange={_onChangeGradientMode} value={gradientModeState} options={gradientModeOptions} />
        </div>
        <div className="sample-grid-sliders">
          <Label>Change Range:</Label>
          {displayModeState !== ThematicDisplayMode.HillShade
            ? <Slider min={min} minLabel={Math.round(min)} max={max} maxLabel={Math.round(max)} step={step} values={[sliderRange.low, sliderRange.high]} onUpdate={_onUpdateRangeSlider} />
            : <>
              <Slider min={0} minLabel="Azimuth" max={360} step={1} values={[azimuthState]} onUpdate={(values) => setAzimuthState(values[0])} />
              <Slider min={0} minLabel="Elevation" max={90} step={1} values={[elevationState]} onUpdate={(values) => setElevationState(values[0])} />
            </>
          }
        </div>
        <Alert type="informational" className="instructions">
          Use the controls to change the view attributes
        </Alert>
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
        },
      );
    }
    return widgets;
  }
}
