/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { ContextRegistryClient, Project } from "@bentley/context-registry-client";
import { AuthorizedFrontendRequestContext, EmphasizeElements, FeatureOverrideType, IModelApp, IModelConnection, MarginPercent, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { ColorDef, GeometricElement3dProps, Placement3d } from "@bentley/imodeljs-common";
import { Point3d, Range3d } from "@bentley/geometry-core";
import { Id64String } from "@bentley/bentleyjs-core";
import { IModelQuery } from "@bentley/imodelhub-client";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { applyZoom } from "./ClashDetectionUI";
import { jsonData } from "./ClashDetectionJsonData";
import ClashDetectionApis from "./ClashDetectionApis";

interface ProjectContext {
  projectId: string;
  imodelId: string;
  requestContext: AuthorizedFrontendRequestContext;
}

export default class ClashDetectionApp {
  public static _clashPinDecorator?: MarkerPinDecorator;
  public static _images: Map<string, HTMLImageElement>;
  public static projectContext: ProjectContext;
  public static clashData: any;

  public static async getIModelInfo(iModelName: string): Promise<ProjectContext> {
    // In testdrive the projectName matches iModelName.  That's not true in general.
    const projectName = iModelName;
    const connectClient = new ContextRegistryClient();
    let project: Project;

    const context = await AuthorizedFrontendRequestContext.create();

    try {
      project = await connectClient.getProject(context, { $filter: `Name+eq+'${iModelName}'` });
    } catch (e) {
      throw new Error(`Project with name "${projectName}" does not exist`);
    }

    const imodelQuery = new IModelQuery();
    imodelQuery.byName(iModelName);
    const imodels = await IModelApp.iModelClient.iModels.get(context, project.wsgId, imodelQuery);
    if (imodels.length === 0)
      throw new Error(`iModel with name "${iModelName}" does not exist in project "${projectName}"`);

    return { projectId: project.wsgId, imodelId: imodels[0].wsgId, requestContext: context };
  }

  public static decoratorIsSetup() {
    return (null != this._clashPinDecorator);
  }

  public static setupDecorator(points: MarkerData[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!ClashDetectionApp._images.has("clash_pin.svg"))
      return;

    this._clashPinDecorator = new MarkerPinDecorator();
    this.setDecoratorPoints(points);
  }

  public static setDecoratorPoints(markersData: MarkerData[]) {
    if (this._clashPinDecorator)
      this._clashPinDecorator.setMarkersData(markersData, this._images.get("clash_pin.svg")!, ClashDetectionApp.visualizeClashCallback);
  }

  public static enableDecorations() {
    if (this._clashPinDecorator)
      IModelApp.viewManager.addDecorator(this._clashPinDecorator);
  }

  public static disableDecorations() {
    if (null != this._clashPinDecorator)
      IModelApp.viewManager.dropDecorator(this._clashPinDecorator);
  }

  public static async getClashData(): Promise<any> {
    if (ClashDetectionApp.clashData === undefined) {
      const runsResponse = await ClashDetectionApis.getProjectValidationRuns();
      if (runsResponse !== undefined && runsResponse.validationRuns !== undefined && runsResponse.validationRuns.length !== 0) {
        // Get validation result
        const resultResponse = await ClashDetectionApis.getValidationUrlResponse(runsResponse.validationRuns[0]._links.result.href);
        if (resultResponse !== undefined && resultResponse.clashDetectionResult !== undefined)
          ClashDetectionApp.clashData = resultResponse;
      }
      if (ClashDetectionApp.clashData === undefined)
        ClashDetectionApp.clashData = jsonData;
    }
    return new Promise((resolve) => { resolve(ClashDetectionApp.clashData); });
  }

  public static async getClashMarkersData(imodel: IModelConnection): Promise<MarkerData[]> {
    const markersData: MarkerData[] = [];
    const clashData = await ClashDetectionApp.getClashData();

    let count = 0;
    for (const clash of clashData.clashDetectionResult) {
      const point = await this.calcClashCenter(imodel, clash.elementAId, clash.elementBId);
      const title = "Collision(s) found:";
      const description = `Element A: ${clash.elementALabel}<br>Element B: ${clash.elementBLabel}`;
      const clashMarkerData: MarkerData = { point, data: clash, title, description };
      markersData.push(clashMarkerData);
      count++;
      if (count > 60)
        break;
    }
    return new Promise((resolve) => { resolve(markersData); });
  }

  private static async calcClashCenter(imodel: IModelConnection, elementAId: string, elementBId: string): Promise<Point3d> {
    let rangeA: any;
    const elemAProps = (await imodel.elements.getProps([elementAId])) as GeometricElement3dProps[];
    if (elemAProps.length !== 0) {
      elemAProps.forEach((prop: GeometricElement3dProps) => {
        const placement = Placement3d.fromJSON(prop.placement);
        rangeA = placement.calculateRange();
      });
    }
    let rangeB: any;
    const elemBProps = (await imodel.elements.getProps([elementBId])) as GeometricElement3dProps[];
    if (elemBProps.length !== 0) {
      elemBProps.forEach((prop: GeometricElement3dProps) => {
        const placement = Placement3d.fromJSON(prop.placement);
        rangeB = placement.calculateRange();
      });
    }

    return rangeA.intersect(rangeB).center;
  }

  public static visualizeClashCallback = (clashData: any) => {
    ClashDetectionApp.visualizeClash(clashData.elementAId, clashData.elementBId);
  }

  public static visualizeClash = (elementAId: string, elementBId: string) => {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
    emph.overrideElements(elementAId, vp, ColorDef.red, FeatureOverrideType.ColorOnly, true);
    emph.overrideElements(elementBId, vp, ColorDef.blue, FeatureOverrideType.ColorOnly, false);
    emph.wantEmphasis = true;
    emph.emphasizeElements([elementAId, elementBId], vp, undefined, false);

    if (applyZoom) {
      const viewChangeOpts: ViewChangeOptions = {};
      viewChangeOpts.animateFrustumChange = true;
      viewChangeOpts.marginPercent = new MarginPercent(0.1, 0.1, 0.1, 0.1);
      vp.zoomToElements([elementAId, elementBId], { ...viewChangeOpts });
    }
  }

  public static resetDisplay() {
    if (!IModelApp.viewManager.selectedView)
      return;

    const vp = IModelApp.viewManager.selectedView;
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
  }
}
