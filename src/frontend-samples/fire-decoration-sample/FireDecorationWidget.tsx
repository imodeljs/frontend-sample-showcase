/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect, useMemo } from "react";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { Button, Select, SelectOption, Slider, ToggleSwitch } from "@itwin/itwinui-react";
import FireDecorationApi from "./FireDecorationApi";
import { FireEmitter } from "./FireDecorator";
import { Point3d, Range2d, Transform } from "@itwin/core-geometry";
import { IModelApp, Viewport } from "@itwin/core-frontend";
import { assert } from "@itwin/core-bentley";
import "./FireDecoration.scss";

interface Fire {
  particleNumScale: number;
  height: number;
  effectRange: Range2d; // Assumed to be a square.
  enableSmoke: boolean;
  isOverlay: boolean;
}

const FireDecorationWidget: React.FunctionComponent = () => {
  const _defaultFireState: Fire = {
    particleNumScale: 0,
    height: 0,
    effectRange: Range2d.createXYXY(0, 0, 0, 0),
    enableSmoke: false,
    isOverlay: false,
  };
  const _lampElementIds = ["0x3a5", "0x1ab", "0x32b", "0x2ab", "0x22b"];
  const iModelConnection = useActiveIModelConnection();
  const [isLoadingState, setIsLoadingState] = React.useState<boolean>(true);
  const [selectedEmitterState, setSelectedEmitterState] = React.useState<FireEmitter>();
  const [paramsNameState, setParamsNameState] = React.useState<string>(FireDecorationApi.predefinedParams.keys().next().value);
  const [fireState, setFireState] = React.useState<Fire>({
    particleNumScale: 0,
    height: 0,
    effectRange: Range2d.createXYXY(0, 0, 0, 0),
    enableSmoke: false,
    isOverlay: false,
  });

  useEffect(() => {
    FireDecorationApi.initTools();

    return () => {
      FireDecorationApi.dispose();
    };
  }, []);

  useEffect(() => {
    if (iModelConnection) {
      const vp = IModelApp.viewManager.selectedView;
      if (vp) {
        initView(vp).then(() => setIsLoadingState(false))
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
      } else {
        IModelApp.viewManager.onViewOpen.addOnce((viewport: Viewport) => {
          initView(viewport).then(() => setIsLoadingState(false))
            .catch((error) => {
              // eslint-disable-next-line no-console
              console.error(error);
            });
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iModelConnection]);

  useEffect(() => {
    FireDecorationApi.highlightEmitter(selectedEmitterState);
    const currentParams: Fire = selectedEmitterState?.params ?? _defaultFireState;
    setFireState(currentParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedEmitterState]);

  useEffect(() => {
    if (selectedEmitterState)
      selectedEmitterState.configure(fireState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fireState]);

  const initView = async (viewport: Viewport) => {
    // Query for element origin and bounding box.
    return FireDecorationApi.queryElements(viewport.iModel, _lampElementIds).then(async (results) => {
      const params = FireDecorationApi.predefinedParams.get("Candle") ?? FireDecorationApi.predefinedParams.keys().next().value;
      results.forEach((source, index) => {
        FireDecorationApi.createFireDecorator(source.origin, params, viewport)
          .catch((error) => {
            // eslint-disable-next-line no-console
            console.error(error);
          });
        // If it's the first placed, zoom to it.
        if (index === 0) {
          let volume = source.bBox.clone();
          // Manipulate the volume that the viewport will zoom to.
          // We want the view to be zoomed out (scaling the volume up).
          volume.scaleAboutCenterInPlace(5);
          // We want the element in the bottom half of the view (translate the volume along the positive z(up) axis).
          volume = Transform.createTranslationXYZ(0, 0, volume.zLength() * 0.25).multiplyRange(volume);
          viewport.zoomToVolume(volume);
        }
      });
    });
  };

  /** Starts a tool that will place a new emitter. */
  const startPlacementTool = () => {
    FireDecorationApi.startPlacementTool(async (point: Point3d, viewport: Viewport) => {
      const params = FireDecorationApi.predefinedParams.get(paramsNameState);
      assert(params !== undefined, "Value is set based on keys of map.");
      params.toolTipInfo = paramsNameState;
      const selectedEmitter = await FireDecorationApi.createFireDecorator(point, params, viewport);
      setSelectedEmitterState(selectedEmitter);
    });
  };

  /** Deletes the selected fire decorator emitter. */
  const dropSelected = () => {
    if (selectedEmitterState) {
      FireDecorationApi.dropDecorator(selectedEmitterState);
      selectedEmitterState?.dispose();
      setSelectedEmitterState(undefined);
    }
  };

  /** Deletes all decorators. */
  const dropAllEmitters = () => {
    setSelectedEmitterState(undefined);
    FireDecorationApi.disposeAllEmitters();
  };

  /** Creates a square 2d range with a given length. */
  const createSquareRange2d = (length: number): Range2d => {
    const half = length / 2;
    return Range2d.createXYXY(-half, -half, half, half);
  };

  const noEmitterSelected = selectedEmitterState === undefined;
  const options = useMemo(() => {
    const opts: SelectOption<string>[] = [];
    for (const key of FireDecorationApi.predefinedParams.keys()) {
      opts.push({
        value: key,
        label: key,
      });
    }
    return opts;
  }, []);

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div>
        <div className="sample-heading">
          <span>Place New Emitter</span>
        </div>
        <div className={"sample-options-2col"}>
          <Button styleType="cta" disabled={isLoadingState} onClick={startPlacementTool}>Place</Button>
          <Select<string> options={options} value={paramsNameState} onChange={setParamsNameState} />
        </div>
        <hr />
        <div style={{ display: "flex", justifyContent: "space-evenly" }}>
          <Button styleType="high-visibility" disabled={isLoadingState} onClick={dropAllEmitters}>Delete all emitters</Button>
        </div>
      </div>
      <hr></hr>
      <div className="sample-heading">
        <span>Configure Selected Emitter</span>
      </div>
      <div className={"sample-options-2col"}>
        <label>Particle Count</label>
        <Slider min={0} max={1} step={0.02} values={[fireState.particleNumScale]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => setFireState({ ...fireState, particleNumScale: values[0] })} />
        <label>Height</label>
        <Slider min={0} max={5} step={0.02} values={[fireState.height]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => setFireState({ ...fireState, height: values[0] })} />
        <label>Width</label>
        {/* The UI of this sample assumes effectRange is a square. */}
        <Slider min={0} max={6} step={0.2} values={[fireState.effectRange.xLength()]} disabled={noEmitterSelected} onUpdate={(values: readonly number[]) => setFireState({ ...fireState, effectRange: createSquareRange2d(values[0]) })} />
        <label>Smoke</label>
        <ToggleSwitch checked={fireState.enableSmoke} disabled={noEmitterSelected} onChange={(e) => setFireState({ ...fireState, enableSmoke: e.target.checked })} />
        <label>Overlay Graphics</label>
        <ToggleSwitch checked={fireState.isOverlay} disabled={noEmitterSelected} onChange={(e) => setFireState({ ...fireState, isOverlay: e.target.checked })} />

      </div>
      <div className={"sample-options-2col"}>
        <Button disabled={noEmitterSelected} onClick={dropSelected}>Drop</Button>
        <Button disabled={isLoadingState || noEmitterSelected} onClick={() => setSelectedEmitterState(undefined)}>Deselect</Button>
      </div>
    </div>
  );
};

export class FireDecorationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "FireDecorationWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "FireDecorationWidget",
          label: "Fire Decoration Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <FireDecorationWidget />,
        },
      );
    }
    return widgets;
  }
}
