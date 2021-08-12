/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import React, { useEffect } from "react";
import { Select } from "@bentley/ui-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { StandardViewId } from "@bentley/imodeljs-frontend";
import "./AnimationWidget.scss";
import AnimationApi from "./AnimationApi";
import { AnalysisDecorator } from "./AnalysisDecorator";
import { useActiveViewport } from "@bentley/ui-framework";
const meshTypes = ["Cantilever", "Flat with waves"];

export const AnimationWidget: React.FunctionComponent = () => {
  const [meshType, setMeshType] = React.useState<{ meshPicker: string, stylePicker: string[], defaultStylePicker: string }>({ meshPicker: "Cantilever", stylePicker: [], defaultStylePicker: "" });
  const viewport = useActiveViewport();

  const renderAnimation = async (meshingType: string) => {
    if (viewport) {
      const meshes = await Promise.all([
        AnimationApi.createMesh("Cantilever", 100),
        AnimationApi.createMesh("Flat with waves"),
      ]);
      if (AnalysisDecorator.decorator) {
        viewport.displayStyle.settings.analysisStyle = undefined;
        AnalysisDecorator.decorator.dispose();
      }
      const mesh = meshingType === "Cantilever" ? meshes[0] : meshes[1];
      AnalysisDecorator.decorator = new AnalysisDecorator(viewport, mesh);
      const meshStyle: string[] = [];
      for (const name of AnalysisDecorator.decorator.mesh.styles.keys()) {
        meshStyle.push(name);
      };
      setMeshType({ meshPicker: meshingType, stylePicker: [...meshStyle], defaultStylePicker: meshStyle[0] });
    }
  };

  useEffect(() => {
    if (viewport) {
      const viewFlags = viewport.viewFlags.clone();
      viewFlags.visibleEdges = true;
      viewFlags.hiddenEdges = true;
      viewport.viewFlags = viewFlags;
      viewport.setStandardRotation(StandardViewId.Iso);
      viewport.zoomToVolume(viewport.iModel.projectExtents);
    }
  }, [viewport]);

  useEffect(() => {
    if (!viewport)
      return;
    renderAnimation("Cantilever");
  }, []);

  const meshTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    renderAnimation(event.target.value);
  };

  const meshStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    viewport!.displayStyle.settings.analysisStyle = AnalysisDecorator.decorator.mesh.styles.get(event.target.value);
    setMeshType({ ...meshType, defaultStylePicker: event.target.value });
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col">
          <span>Mesh Picker:</span>
          <Select options={meshTypes} value={meshType.meshPicker} onChange={(event) => meshTypeChange(event)} />
          <span>Style Picker:</span>
          <Select options={meshType.stylePicker} value={meshType.defaultStylePicker} onChange={(event) => meshStyleChange(event)} />
        </div>
      </div>
    </>
  );
};
export class AnimationWidgetProvider implements UiItemsProvider {
  public readonly id: string = "AnimationWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {

          id: "AnimationWidgetProvider",
          label: "Visualization Controls",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <AnimationWidget />,
        }
      );
    }
    return widgets;
  }
}
