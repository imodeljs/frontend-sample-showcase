import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import { IModelConnection, Viewport } from "@bentley/imodeljs-frontend";
import React from "react";
import { HeatmapDecoratorApp } from ".";

export function getHeatmapDecoratorSpec(): SampleSpec {
  return ({
    name: "heatmap-decorator-sample",
    label: "Heatmap Decorator",
    image: "heatmap-decorator-thumbnail.png",
    files: [
      { name: "HeatmapSample.tsx", import: import("!!raw-loader!./index") },
      { name: "GithubLink.tsx", import: import("!!raw-loader!../../Components/GithubLink") },
      { name: "samples-common.scss", import: import("!!raw-loader!../../common/samples-common.scss") },
      { name: "HeatmapDecorator.tsx", import: import("!!raw-loader!./HeatmapDecorator") },
      { name: "PointSelector.tsx", import: import("!!raw-loader!../../common/PointSelector/PointSelector") },
      { name: "PointGenerators.tsx", import: import("!!raw-loader!../../common/PointSelector/PointGenerators") },
    ],
    modelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House],
    handlesViewSetup: true,
    setup: HeatmapDecoratorApp.setup,
    teardown: HeatmapDecoratorApp.teardown,
  });
}