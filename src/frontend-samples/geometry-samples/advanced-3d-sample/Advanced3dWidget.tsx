/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import { Select } from "@bentley/ui-core";
import Advanced3dApp from "./Advanced3dApp";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";

export interface ControlsWidgetProps {
  decorator: GeometryDecorator;
}

export const Advanced3dWidget: React.FunctionComponent<ControlsWidgetProps> = (props: ControlsWidgetProps) => {
  const [shape, setShape] = React.useState<string>("Sweeps");
  const [color] = React.useState<ColorDef>(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
  const [sweepType, setSweepType] = React.useState<string>("Linear");

  useEffect(() => {
    _setGeometry();
  });

  const _setGeometry = () => {
    props.decorator.clearGeometry();
    const polyface = Advanced3dApp.getPolyface(shape, sweepType);
    props.decorator.setColor(color);
    props.decorator.addGeometry(polyface);
    props.decorator.drawBase();
  }

  // Display drawing and sheet options in separate sections.
  return (
    <>
      <div className="sample-options-2col">
        <span>Shape:</span>
        <Select options={["Sweeps", "Mitered Pipes"]} onChange={(event) => { setShape(event.target.value); }} />
        {shape === "Sweeps" ? <span>Sweep Type:</span> : undefined}
        {shape === "Sweeps" ? <Select options={["Linear", "Ruled", "Rotational"]} onChange={(event) => { setSweepType(event.target.value); }} /> : undefined}
      </div>
    </>
  );

};

export class Advanced3dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Advanced3dWidgetProvider";
  private decorator: GeometryDecorator;
  constructor(decorator: GeometryDecorator) {
    this.decorator = decorator;
  }

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "ViewerOnly2dWidget",
          label: "2D View Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <Advanced3dWidget decorator={this.decorator} />,
        }
      );
    }
    return widgets;
  }
}
