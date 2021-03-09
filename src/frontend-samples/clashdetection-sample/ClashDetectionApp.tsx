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
import { ClashPinDecorator } from "./ClashMarkers";
import { ClashMarkerPoint } from "./ClashDetectionUI";
import { jsonData } from "./ClashDetectionJsonData";

interface ProjectContext {
  projectId: string;
  imodelId: string;
  requestContext: AuthorizedFrontendRequestContext;
}

export default class ClashDetectionApp {
  public static _clashPinDecorator?: ClashPinDecorator;
  public static _images: Map<string, HTMLImageElement>;
  public static projectContext: ProjectContext;

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

  public static setupDecorator(points: ClashMarkerPoint[]) {
    // If we failed to load the image, there is no point in registering the decorator
    if (!ClashDetectionApp._images.has("clash_pin.svg"))
      return;

    this._clashPinDecorator = new ClashPinDecorator();
    this.setDecoratorPoints(points);
  }

  public static setDecoratorPoints(points: ClashMarkerPoint[]) {
    if (this._clashPinDecorator)
      this._clashPinDecorator.setPoints(points, this._images.get("clash_pin.svg")!);
  }

  public static enableDecorations() {
    if (this._clashPinDecorator)
      IModelApp.viewManager.addDecorator(this._clashPinDecorator);
  }

  public static disableDecorations() {
    if (null != this._clashPinDecorator)
      IModelApp.viewManager.dropDecorator(this._clashPinDecorator);
  }

  public static async setMarkerPoints(imodel: IModelConnection): Promise<ClashMarkerPoint[]> {
    const points: ClashMarkerPoint[] = [];
    let count = 0;
    for (const clash of jsonData.clashDetectionResult) {
      const point = await this.calcClashCenter(imodel, clash.elementAId, clash.elementBId);
      const clashMarkerPoint: ClashMarkerPoint = { point, jsonData: clash };
      points.push(clashMarkerPoint);
      count++;
      if (count > 60)
        break;
    }
    return new Promise((resolve) => {resolve(points); });
  }

  private static async calcClashCenter(imodel: IModelConnection, elementAId: string, elementBId: string): Promise<Point3d> {
    const elementIds: Id64String[] = [];
    elementIds.push(elementAId);
    elementIds.push(elementBId);
    const volume = Range3d.createNull();
    const elemProps = (await imodel.elements.getProps(elementIds)) as GeometricElement3dProps[];

    if (elemProps.length !== 0) {
      elemProps.forEach((prop: GeometricElement3dProps) => {
        const placement = Placement3d.fromJSON(prop.placement);
        volume.extendRange(placement.calculateRange());
      });
    }
    return volume.center;
  }

  public static visualizeClash(elementAId: any, elementBId: any, applyZoom: boolean) {
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
