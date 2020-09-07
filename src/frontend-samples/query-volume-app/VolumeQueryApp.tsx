/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { EmphasizeElements, IModelApp, ScreenViewport, ViewClipClearTool, ViewClipDecorationProvider, ViewClipTool } from "@bentley/imodeljs-frontend";
import { ClipMaskXYZRangePlanes, ClipPlaneContainment, ClipShape, ClipUtilities, ClipVector, Range3d } from "@bentley/geometry-core";
import SampleApp from "common/SampleApp";
import VolumeQueryUI from "./VolumeQueryUI";
import { ColorDef, GeometryContainmentRequestProps } from "@bentley/imodeljs-common";
import { BentleyStatus, Id64Array } from "@bentley/bentleyjs-core";
import { PresentationLabelsProvider } from "@bentley/presentation-components";
import { InstanceKey } from "@bentley/presentation-common";

export interface SpatialElements {
  insideTheBox: PhysicalElement[];
  outsideTheBox: PhysicalElement[];
  overlap: PhysicalElement[];
}

export interface SpatialElementsColors {
  insideColor: ColorDef;
  outsideColor: ColorDef;
  overlapColor: ColorDef;
}

export interface PhysicalElement {
  id: string;
  name: string;
  className: string;
}
export class VolumeQueryApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <VolumeQueryUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  /* Method for clearing all clips in the viewport */
  public static clearClips(vp: ScreenViewport) {
    // Run the ViewClipClearTool and hide the decorators
    IModelApp.tools.run(ViewClipClearTool.toolId);
    ViewClipDecorationProvider.create().toggleDecoration(vp);
  }

  /* Method for adding a new box range around the model's extents */
  public static addBoxRange = (vp: ScreenViewport, range?: Range3d, isClippingOn?: boolean) => {
    // Get the range of the model contents.
    if (range === undefined) {
      range = vp.view.computeFitRange();
      // Remove the top half of the z-range so we have smaller box
      range.high.z = (range.high.z + range.low.z) / 2.0;
    }
    // Create a box for the ClipVector.
    const block: ClipShape = ClipShape.createBlock(range, range.isAlmostZeroZ ? ClipMaskXYZRangePlanes.XAndY : ClipMaskXYZRangePlanes.All, false, false);
    // Create the ClipVector
    const clip: ClipVector = ClipVector.createEmpty();
    // Add the box to the Clipvector and set it in the ScreenViewport.
    clip.appendReference(block);
    // Call enableClipVolume to ensure all clip flags are properly set
    ViewClipTool.enableClipVolume(vp);
    // Turning off the clipping feature.
    vp.view.viewFlags.clipVolume = isClippingOn === undefined ? false : isClippingOn;
    vp.view.setViewClip(clip);
    VolumeQueryApp.addDecorators(vp);
  }

  /* Method for adding decorators to the viewport */
  public static addDecorators(vp: ScreenViewport) {
    // Create a clip decorator. Selecting the clip decoration to immediately show the handles is the default.
    const vcdp: ViewClipDecorationProvider = ViewClipDecorationProvider.create();
    // Default behavior is to hide the decorators on deselect. We want to keep the decorators showing in this example.
    vcdp.clearDecorationOnDeselect = false;
    vcdp.showDecoration(vp);
    // The decorators require the SelectTool being active.
    IModelApp.toolAdmin.startDefaultTool();
  }

  /* Getting the range of currect box */
  public static getRangeOfBox(vp: ScreenViewport): Range3d | undefined {
    const viewClip = vp.view.getViewClip();
    if (viewClip !== undefined) {
      return ClipUtilities.rangeOfClipperIntersectionWithRange(
        viewClip,
        vp.view.computeFitRange(),
      );
    }

    return undefined;
  }

  /* Getting all elements that are spatially represented in iModel*/
  public static async getAllSpacialElements(vp: ScreenViewport): Promise<PhysicalElement[]> {
    const esqlQuery = "SELECT ECInstanceId, ECClassId FROM BisCore.PhysicalElement";
    const elementsAsync = vp.iModel.query(esqlQuery);
    const elements: PhysicalElement[] = [];
    for await (const element of elementsAsync) {
      elements.push({ id: element.id, className: element.className, name: "" });
    }

    const presentationProvider = new PresentationLabelsProvider({ imodel: vp.iModel });
    const packedInstancesKeys: InstanceKey[][] = [];
    const instanceKeys: InstanceKey[] = elements.map((element) => {
      return { className: element.className.replace(".", ":"), id: element.id };
    });

    /* Sorting elements into packages. Instead of one 3000 length array I will have 3 x 1000 lenght arrays */
    const packsOfInstanceKeys = Math.floor(instanceKeys.length / 1000);
    for (let i = 0; i <= packsOfInstanceKeys; i++) {
      if (i !== packsOfInstanceKeys) {
        packedInstancesKeys.push(instanceKeys.slice(i * 1000, (i + 1) * 1000));
      } else {
        packedInstancesKeys.push(instanceKeys.slice(i * 1000, instanceKeys.length + 1));
      }
    }

    /* Getting elements names */
    const elementNames: string[] = [];
    for (const keysArray of packedInstancesKeys) {
      const names = await presentationProvider.getLabels(keysArray);
      elementNames.push(...names);
    }

    for (let i = 0; i < elementNames.length; i++)
      elements[i].name = elementNames[i];

    return elements;
  }

  /* Clear color from colored elements */
  public static clearColoredSelection(vp: ScreenViewport) {
    EmphasizeElements.getOrCreate(vp).clearOverriddenElements(vp);
  }

  /* Sort given elements - inside, outside the box and overlap */
  public static async getSortedSpatialElements(vp: ScreenViewport, candidates: PhysicalElement[]): Promise<SpatialElements | undefined> {
    const clip = vp.view.getViewClip();
    if (clip === undefined)
      return;

    const candidatesId = candidates.map((candidate) => candidate.id) as Id64Array;
    const requestProps: GeometryContainmentRequestProps = {
      candidates: candidatesId,
      clip: clip.toJSON(),
      allowOverlaps: true,
      viewFlags: vp.viewFlags.toJSON(),
    };

    const result = await vp.iModel.getGeometryContainment(requestProps);
    if (BentleyStatus.SUCCESS !== result.status || undefined === result.candidatesContainment)
      return;

    const insideTheBox: PhysicalElement[] = [];
    const outsideTheBox: PhysicalElement[] = [];
    const overlap: PhysicalElement[] = [];

    result.candidatesContainment.forEach((val: ClipPlaneContainment, index: number) => {
      switch (val) {
        case ClipPlaneContainment.StronglyInside:
          insideTheBox.push(candidates[index]);
          break;
        case ClipPlaneContainment.Ambiguous:
          overlap.push(candidates[index]);
          break;
        case ClipPlaneContainment.StronglyOutside:
          outsideTheBox.push(candidates[index]);
          break;
      }
    });

    return { insideTheBox, outsideTheBox, overlap };
  }

  public static async colorSpatialElements(vp: ScreenViewport, spatialElements: SpatialElements, colors: SpatialElementsColors) {
    EmphasizeElements.getOrCreate(vp).overrideElements(spatialElements.insideTheBox.map((x) => x.id), vp, colors.insideColor);
    EmphasizeElements.getOrCreate(vp).overrideElements(spatialElements.outsideTheBox.map((x) => x.id), vp, colors.outsideColor);
    EmphasizeElements.getOrCreate(vp).overrideElements(spatialElements.overlap.map((x) => x.id), vp, colors.overlapColor);
    EmphasizeElements.getOrCreate(vp).defaultAppearance = EmphasizeElements.getOrCreate(vp).createDefaultAppearance();
  }
}
