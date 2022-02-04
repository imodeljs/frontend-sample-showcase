/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { IModelApp, IModelConnection } from "@itwin/core-frontend";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { Point3d } from "@itwin/core-geometry";
import { Presentation } from "@itwin/presentation-frontend";
import { InstanceKey, KeySet, KeySetJSON, LabelDefinition } from "@itwin/presentation-common";
import { IssueGet } from "./IssuesClient";

export interface LabelWithId extends LabelDefinition {
  id: string;
}

export default class IssuesApi {

  public static async getElementKeySet(elementsId: string) {
    if (!elementsId || elementsId.trim().length === 0)
      return new KeySet();

    const keySetJSON: KeySetJSON = JSON.parse(elementsId);
    return KeySet.fromJSON(keySetJSON);
  }

  public static async getElementInfo(iModel: IModelConnection, keySet: KeySet): Promise<LabelWithId[]> {
    const instanceKeys: InstanceKey[] = [];
    keySet.instanceKeys.forEach((currentIds: Set<string>, key: string) => {
      currentIds.forEach((value: string) => { instanceKeys.push({ className: key, id: value }); });
    });

    const labels = await Presentation.presentation.getDisplayLabelDefinitions({ imodel: iModel, keys: instanceKeys });

    return labels.map((label, index) => ({ ...label, id: instanceKeys[index].id }));
  }

  public static setupDecorator() {
    return new MarkerPinDecorator();
  }

  public static addDecoratorPoint(decorator: MarkerPinDecorator, issue: IssueGet, pinImage: HTMLImageElement, title?: string, description?: string, onMouseButtonCallback?: any) {
    const markerData: MarkerData = { point: issue.modelPin?.location ?? Point3d.createZero(), title, description, data: issue };
    const scale = { low: .2, high: 1.4 };
    decorator.addMarkerPoint(markerData, pinImage, title, description, scale, onMouseButtonCallback);
  }

  public static enableDecorations(decorator: MarkerPinDecorator) {
    IModelApp.viewManager.addDecorator(decorator);
  }

  public static disableDecorations(decorator: MarkerPinDecorator) {
    IModelApp.viewManager.dropDecorator(decorator);
  }

  public static clearDecoratorPoints(decorator: MarkerPinDecorator) {
    decorator.clearMarkers();
  }
}
