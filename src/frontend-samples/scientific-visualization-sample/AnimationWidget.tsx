import React, { useEffect } from "react";
import { Select } from "@bentley/ui-core";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider } from "@bentley/ui-abstract";
import { IModelApp, StandardViewId, ViewState3d } from "@bentley/imodeljs-frontend";
import "./AnimationWidget.scss";
import Animation3dApi from "./AnimationApi";
import { AnalysisDecorator } from "./AnalysisDecorator";
import { RenderMode } from "@bentley/imodeljs-common";
const meshTypes = ["Cantilever", "Flat with waves"];

export const Animation3dWidget: React.FunctionComponent = () => {
  const [meshType, setMeshType] = React.useState<{ Type: string, Style: string[], DefaultStyle: string }>({ Type: "Cantilever", Style: [], DefaultStyle: "" });
  const vp = IModelApp.viewManager.selectedView;

  const drawAnimation = async (meshingType: string) => {
    if (vp) {
      const meshes = await Promise.all([
        Animation3dApi.createMesh("Cantilever", 100),
        Animation3dApi.createMesh("Flat with waves"),
      ]);
      const mesh = meshingType === "Cantilever" ? meshes[0] : meshes[1];

      if (AnalysisDecorator.decorator) {
        vp.displayStyle.settings.analysisStyle = undefined;
        AnalysisDecorator.decorator.dispose();
      }
      AnalysisDecorator.decorator = new AnalysisDecorator(vp, mesh);

      vp.setStandardRotation(StandardViewId.Iso);
      vp.zoomToVolume(vp.iModel.projectExtents);

      const viewFlags = vp.viewFlags.clone();
      viewFlags.renderMode = RenderMode.SolidFill;
      viewFlags.visibleEdges = true;

      vp.viewFlags = viewFlags;
      // (vp.view as ViewState3d).getDisplayStyle3d().settings.environment = {
      //   sky: {
      //     display: true,
      //     twoColor: true,
      //     nadirColor: 0xdfefff,
      //     zenithColor: 0xffefdf,
      //   },
      // };

      console.log(AnalysisDecorator.decorator.mesh.styles);

      const meshStyle: string[] = [];
      for (const name of AnalysisDecorator.decorator.mesh.styles.keys()) {
        meshStyle.push(name);
      };
      setMeshType({ Type: meshingType, Style: [...meshStyle], DefaultStyle: meshStyle[0] });
    }
  };

  useEffect(() => {
    drawAnimation("Cantilever");
  }, []);

  const meshTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    drawAnimation(event.target.value);
  };

  const meshStyleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    vp!.displayStyle.settings.analysisStyle = AnalysisDecorator.decorator.mesh.styles.get(event.target.value);
    setMeshType({ ...meshType, DefaultStyle: event.target.value });
  };

  return (
    <>
      <div className="sample-options">
        <div className="sample-options-2col">
          <span>Mesh Picker:</span>
          <Select options={meshTypes} value={meshType.Type} onChange={(event) => meshTypeChange(event)} />
          <span>Style Picker:</span>
          <Select options={meshType.Style} value={meshType.DefaultStyle} onChange={(event) => meshStyleChange(event)} />
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
          // defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <Animation3dWidget />,
        }
      );
    }
    return widgets;
  }
}
