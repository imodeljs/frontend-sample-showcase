/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { ColorByName, ColorDef } from "@bentley/imodeljs-common";
import { Select } from "@bentley/ui-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { GeometryDecorator } from "common/Geometry/GeometryDecorator";
import Advanced3dApi from "./Advanced3dApi";
import "./Advanced3d.scss";

export const Advanced3dWidget: React.FunctionComponent = () => {
  const [decoratorState, setDecoratorState] = React.useState<GeometryDecorator>();
  const [shape, setShape] = React.useState<string>("Sweeps");
  const [color] = React.useState<ColorDef>(ColorDef.fromTbgr(ColorDef.withTransparency(ColorDef.create(ColorByName.cyan).tbgr, 50)));
  const [sweepType, setSweepType] = React.useState<string>("Linear");

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
    if (decoratorState) {
      decoratorState.clearGeometry();
      const polyface = Advanced3dApi.getPolyface(shape, sweepType);
      decoratorState.setColor(color);
      decoratorState.addGeometry(polyface);
      decoratorState.drawBase();
    }
  });

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col">
          <span>Shape:</span>
          <Select options={["Sweeps", "Mitered Pipes"]} onChange={(event) => { setShape(event.target.value); }} />
          {shape === "Sweeps" ? <span>Sweep Type:</span> : undefined}
          {shape === "Sweeps" ? <Select options={["Linear", "Ruled", "Rotational"]} onChange={(event) => { setSweepType(event.target.value); }} /> : undefined}
        </div>
      </div>
    </>
  );

};

export class Advanced3dWidgetProvider implements UiItemsProvider {
  public readonly id: string = "Advanced3dWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "Advanced3dWidget",
          label: "Advanced 3d Selector",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <Advanced3dWidget />,
        }
      );
    }
    return widgets;
  }
}
