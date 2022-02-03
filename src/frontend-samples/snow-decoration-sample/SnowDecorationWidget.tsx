/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useCallback, useEffect } from "react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
import { useActiveViewport } from "@itwin/appui-react";
import SnowDecorationApi from "./SnowDecorationApi";
import { SnowParams } from "./SnowDecorator";
import { Alert, Button, Label, LabeledSelect, Slider, ToggleSwitch } from "@itwin/itwinui-react";
import "./SnowDecoration.scss";

const windRange = 600;

const SnowDecorationWidget: React.FunctionComponent = () => {
  const viewport = useActiveViewport();
  const [propsName, setPropsName] = React.useState<string>(SnowDecorationApi.predefinedProps.keys().next().value);
  const [wind, setWind] = React.useState<number>(0);
  const [particleDensity, setParticleDensity] = React.useState<number>(0);
  const [pauseEffect, setPauseEffect] = React.useState<boolean>(false);

  /** Configures active snow decorators (should only ever be one in this sample). */
  const configureEffect = useCallback((params: Partial<SnowParams> & { pauseEffect?: boolean }) => {
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
            })
              .catch((error) => {
                // eslint-disable-next-line no-console
                console.error(error);
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
  }, [propsName]);

  useEffect(() => {
    if (!viewport)
      return;

    const props = SnowDecorationApi.predefinedProps.get(propsName)!;
    SnowDecorationApi.createSnowDecorator(viewport, props).then(() => {
      setParticleDensity(props.params.particleDensity);
      setWind(props.params.windVelocity);
      setPauseEffect(false);
    })
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }, [viewport, propsName]);

  useEffect(() => {
    configureEffect({ particleDensity });
  }, [configureEffect, particleDensity]);

  useEffect(() => {
    configureEffect({ windVelocity: wind });
  }, [configureEffect, wind]);

  useEffect(() => {
    configureEffect({ pauseEffect });
  }, [configureEffect, pauseEffect]);

  const options = [...SnowDecorationApi.predefinedProps.keys()].map((key) => ({ value: key, label: key }));

  // Display drawing and sheet options in separate sections.
  return (
    <div className="sample-options">
      <div className="sample-grid">
        <LabeledSelect label="Select Effect" options={options} value={propsName} onChange={setPropsName} size="small" />
        <ToggleSwitch label="Pause Effect" checked={pauseEffect} onChange={() => setPauseEffect(!pauseEffect)} />
        <div>
          <Label>Particle Density</Label>
          <Slider min={0} max={0.01135} step={0.0001} values={[particleDensity]} onUpdate={(values) => setParticleDensity(values[0])} />
        </div>
        <div className="wind-grid">
          <div>
            <Label>Wind</Label>
            <Slider min={-windRange} max={windRange} values={[wind]} step={0.25} onUpdate={(values) => setWind(values[0])} />
          </div>
          <Button size="small" onClick={() => setWind(0)}>Reset</Button>
        </div>
        <Alert type="informational" className="instructions">
          Apply particle effects to the model
        </Alert>
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
          defaultState: WidgetState.Open,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <SnowDecorationWidget />,
        },
      );
    }
    return widgets;
  }
}
