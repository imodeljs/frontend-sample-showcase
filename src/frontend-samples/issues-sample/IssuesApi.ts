/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { IModelApp, IModelConnection } from "@bentley/imodeljs-frontend";
import { MarkerData, MarkerPinDecorator } from "frontend-samples/marker-pin-sample/MarkerPinDecorator";
import { Point3d } from "@bentley/geometry-core";
import { Presentation } from "@bentley/presentation-frontend";
import { InstanceKey, KeySet, KeySetJSON, LabelDefinition } from "@bentley/presentation-common";
import { IssueGet } from "./IssuesClient";

export interface LabelWithId extends LabelDefinition {
  id: string;
}

export default class IssuesApi {
  public static _issuesPinDecorator?: MarkerPinDecorator;

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

  public static decoratorIsSetup() {
    return (null != this._issuesPinDecorator);
  }

  public static setupDecorator() {
    if (undefined === this._issuesPinDecorator)
      this._issuesPinDecorator = new MarkerPinDecorator();
  }

  public static addDecoratorPoint(issue: IssueGet, pinImage: HTMLImageElement, title?: string, description?: string, onMouseButtonCallback?: any) {
    const markerData: MarkerData = { point: issue.modelPin?.location ?? Point3d.createZero(), title, description, data: issue };
    const scale = { low: .2, high: 1.4 };
    if (this._issuesPinDecorator)
      this._issuesPinDecorator.addMarkerPoint(markerData, pinImage, title, description, scale, onMouseButtonCallback);
  }

  public static enableDecorations() {
    if (this._issuesPinDecorator)
      IModelApp.viewManager.addDecorator(this._issuesPinDecorator);
  }

  public static disableDecorations() {
    if (null != this._issuesPinDecorator) {
      IModelApp.viewManager.dropDecorator(this._issuesPinDecorator);
      this._issuesPinDecorator = undefined;
    }
  }
}
