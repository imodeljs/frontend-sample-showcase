import React, { useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { Button, Select, Slider, Toggle } from "@bentley/ui-core";
import { useActiveViewport } from "@bentley/ui-framework";
import SnowDecorationApi from "./SnowDecorationApi";
import { SnowParams } from "./SnowDecorator";
import "./SnowDecoration.scss";

const windRange = 600;

const SnowDecorationWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [propsName, setPropsName] = React.useState<string>(SnowDecorationApi.predefinedProps.keys().next().value);
  const [wind, setWind] = React.useState<number>(0);
  const [particleDensity, setParticleDensity] = React.useState<number>(0);
  const [pauseEffect, setPauseEffect] = React.useState<boolean>(false);

  useEffect(() => {
    if (!viewport)
      return;

    const props = SnowDecorationApi.predefinedProps.get(propsName)!;
    SnowDecorationApi.createSnowDecorator(viewport, props).then(() => {
      setParticleDensity(props.params.particleDensity);
      setWind(props.params.windVelocity);
      setPauseEffect(false);
    });
  }, [viewport, propsName]);

  useEffect(() => {
    configureEffect({ particleDensity });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [particleDensity]);

  useEffect(() => {
    configureEffect({ windVelocity: wind });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wind]);

  useEffect(() => {
    configureEffect({ pauseEffect });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pauseEffect]);

  /** Configures active snow decorators (should only ever be one in this sample). */
  const configureEffect = (params: Partial<SnowParams> & { pauseEffect?: boolean }) => {
    SnowDecorationApi.getSnowDecorators().forEach((decorator) => {
      // if there is an update to the, a texture may need to be updated too.
      if (params.windVelocity !== undefined) {
        const prevWind = decorator.getParams().windVelocity;
        // test if the wind has changed
        if (params.windVelocity !== prevWind) {
          // test if the texture has changed
          const url = SnowDecorationApi.testForTextureUpdate(propsName, params.windVelocity, prevWind);
          if (url) {
            // Set new texture
            SnowDecorationApi.allocateTextureFromUrl(url).then((texture) => {
              decorator.changeTexture(texture);
            });
          }
        }
      }
      // Update if it is paused.
      if (params.pauseEffect !== undefined)
        decorator.pause = params.pauseEffect;
      // Configure the decorator
      decorator.configure(params);
    });
  };

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className={"sample-options-2col"}>
        <label>Select Effect</label>
        <Select options={[...SnowDecorationApi.predefinedProps.keys()]} value={propsName} onChange={(event) => setPropsName(event.target.value)} />
        <label>Pause Effect</label>
        <Toggle isOn={pauseEffect} onChange={(isChecked) => setPauseEffect(isChecked)} />
        <label>Particle Density</label>
        <Slider min={0} max={0.01135} step={0.0001} values={[particleDensity]} onUpdate={(values) => setParticleDensity(values[0])} />
        <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <label>Wind</label>
          <Button onClick={() => setWind(0)}>Zero</Button>
        </span>
        <Slider min={-windRange} max={windRange} values={[wind]} step={0.25} onUpdate={(values) => setWind(values[0])} />
      </div>
    </div>
  );
};

export class SnowDecorationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "SnowDecorationWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "SnowDecorationWidget",
          label: "Snow Decoration Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <SnowDecorationWidget />,
        }
      );
    }
    return widgets;
  }
}
