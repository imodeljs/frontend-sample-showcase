/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { NumberInput, Select } from "@bentley/ui-core";
import { PolyfaceBuilder, StrokeOptions } from "@bentley/geometry-core";
import Simple3dApi from "./Simple3dApi";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";

export const Simple3dWidget: React.FunctionComponent = () => {
  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [shape, setShape] = React.useState<string>("Box");
  const [color] = React.useState<ColorDef>(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
  const [sphereRadius, setSphereRadius] = React.useState<number>(4);
  const [boxLength, setBoxLength] = React.useState<number>(4);
  const [boxWidth, setBoxWidth] = React.useState<number>(4);
  const [boxHeight, setBoxHeight] = React.useState<number>(4);
  const [coneUpperRadius, setConeUpperRadius] = React.useState<number>(3);
  const [coneLowerRadius, setConeLowerRadius] = React.useState<number>(5);
  const [coneHeight, setConeHeight] = React.useState<number>(5);
  const [tpInnerRadius, settpInnerRadius] = React.useState<number>(2);
  const [tpOuterRadius, settpOuterRadius] = React.useState<number>(5);
  const [tpSweep, settpSweep] = React.useState<number>(360);

  useEffect(() => {
    if (!decoratorState) {
      const decorator = new GeometryDecorator();
      IModelApp.viewManager.addDecorator(decorator);
      setDecoratorState(decorator);
    }

    return (() => {
      if (decoratorState)
        IModelApp.viewManager.dropDecorator(decoratorState);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    _setGeometry();
  });

  const _setGeometry = () => {
    if (!decoratorState)
      return;

    decoratorState.clearGeometry();
    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    if (shape === "Cone") {
      const cone = Simple3dApi.createCone(coneHeight, coneLowerRadius, coneUpperRadius);
      if (cone)
        builder.addCone(cone);
    } else if (shape === "Sphere") {
      const sphere = Simple3dApi.createSphere(sphereRadius);
      if (sphere)
        builder.addSphere(sphere);
    } else if (shape === "Box") {
      const box = Simple3dApi.createBox(boxLength, boxWidth, boxHeight);
      if (box)
        builder.addBox(box);
    } else if (shape === "Torus Pipe") {
      const torusPipe = Simple3dApi.createTorusPipe(tpOuterRadius, tpInnerRadius, tpSweep);
      if (torusPipe)
        builder.addTorusPipe(torusPipe);
    }
    const polyface = builder.claimPolyface(false);
    decoratorState.setColor(color);
    decoratorState.addGeometry(polyface);
    decoratorState.drawBase();
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col">
          <span>Shape:</span>
          <Select options={["Box", "Cone", "Sphere", "Torus Pipe"]} onChange={(event) => { setShape(event.target.value); }} />
          {shape === "Sphere" ? <span>Radius:</span> : undefined}
          {shape === "Sphere" ? <NumberInput value={sphereRadius} min={0} max={500} onChange={(value) => { if (value) setSphereRadius(value); }}></NumberInput> : undefined}

          {shape === "Box" ? <span>Length:</span> : undefined}
          {shape === "Box" ? <NumberInput value={boxLength} min={0} max={1000} onChange={(value) => { if (value) setBoxLength(value); }}></NumberInput> : undefined}
          {shape === "Box" ? <span>Width:</span> : undefined}
          {shape === "Box" ? <NumberInput value={boxWidth} min={0} max={1000} onChange={(value) => { if (value) setBoxWidth(value); }}></NumberInput> : undefined}
          {shape === "Box" ? <span>Height:</span> : undefined}
          {shape === "Box" ? <NumberInput value={boxHeight} min={0} max={1000} onChange={(value) => { if (value) setBoxHeight(value); }}></NumberInput> : undefined}

          {shape === "Cone" ? <span>Upper Radius:</span> : undefined}
          {shape === "Cone" ? <NumberInput value={coneUpperRadius} min={0} max={1000} onChange={(value) => { if (value) setConeUpperRadius(value); }}></NumberInput> : undefined}
          {shape === "Cone" ? <span>Lower Radius:</span> : undefined}
          {shape === "Cone" ? <NumberInput value={coneLowerRadius} min={0} max={1000} onChange={(value) => { if (value) setConeLowerRadius(value); }}></NumberInput> : undefined}
          {shape === "Cone" ? <span>Height:</span> : undefined}
          {shape === "Cone" ? <NumberInput value={coneHeight} min={0} max={1000} onChange={(value) => { if (value) setConeHeight(value); }}></NumberInput> : undefined}

          {shape === "Torus Pipe" ? <span>Outer Radius:</span> : undefined}
          {shape === "Torus Pipe" ? <NumberInput value={tpOuterRadius} min={0} max={1000} onChange={(value) => { if (value) settpOuterRadius(value); }}></NumberInput> : undefined}
          {shape === "Torus Pipe" ? <span>Inner Radius:</span> : undefined}
          {shape === "Torus Pipe" ? <NumberInput value={tpInnerRadius} min={0} max={1000} onChange={(value) => { if (value) settpInnerRadius(value); }}></NumberInput> : undefined}
          {shape === "Torus Pipe" ? <span>Sweep:</span> : undefined}
          {shape === "Torus Pipe" ? <NumberInput value={tpSweep} min={0} max={360} onChange={(value) => { if (value) settpSweep(value); }}></NumberInput> : undefined}
        </div>
      </div>
    </>
  );

};

export class Simple3dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Simple3dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "Simple3dWidget",
          label: "Simple 3d Controls",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => {
            return <Simple3dWidget />;
          },
        }
      );
    }
    return widgets;
  }
}
