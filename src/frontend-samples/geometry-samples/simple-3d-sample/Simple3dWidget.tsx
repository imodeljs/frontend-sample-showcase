/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { InteractivePointMarker } from "common/Geometry/InteractivePointMarker";
import { NumberInput, NumericInput, Select } from "@bentley/ui-core";
import { PolyfaceBuilder, StrokeOptions } from "@bentley/geometry-core";
import Simple3dApp from "./Simple3dApp";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";

export interface ControlsWidgetProps {
  decorator: GeometryDecorator;
}

export const Simple3dWidget: React.FunctionComponent<ControlsWidgetProps> = (ControlsWidgetProps) => {
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
    _setGeometry();
  });

  const _setGeometry = () => {
    ControlsWidgetProps.decorator.clearGeometry();
    const options = StrokeOptions.createForCurves();
    options.needParams = false;
    options.needNormals = true;
    const builder = PolyfaceBuilder.create(options);
    if (shape === "Cone") {
      const cone = Simple3dApp.createCone(coneHeight, coneLowerRadius, coneUpperRadius);
      if (cone)
        builder.addCone(cone);
    } else if (shape === "Sphere") {
      const sphere = Simple3dApp.createSphere(sphereRadius);
      if (sphere)
        builder.addSphere(sphere);
    } else if (shape === "Box") {
      const box = Simple3dApp.createBox(boxLength, boxWidth, boxHeight);
      if (box)
        builder.addBox(box);
    } else if (shape === "Torus Pipe") {
      const torusPipe = Simple3dApp.createTorusPipe(tpOuterRadius, tpInnerRadius, tpSweep);
      if (torusPipe)
        builder.addTorusPipe(torusPipe);
    }
    const polyface = builder.claimPolyface(false);
    ControlsWidgetProps.decorator.setColor(color);
    ControlsWidgetProps.decorator.addGeometry(polyface);
    ControlsWidgetProps.decorator.drawBase();
  };

  // Display drawing and sheet options in separate sections.
  return (
    <>
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
    </>
  );

};

export class Simple3dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Simple3dWidgetProvider";
  private decorator: GeometryDecorator;
  constructor(decorator: GeometryDecorator) {
    this.decorator = decorator;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "Simple3dWidget",
          label: "Simple 3d",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <Simple3dWidget decorator={this.decorator} />,
        }
      );
    }
    return widgets;
  }
}
