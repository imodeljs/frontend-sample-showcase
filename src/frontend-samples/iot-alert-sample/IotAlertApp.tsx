/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { EmphasizeElements, FeatureOverrideType, IModelApp, IModelConnection, ScreenViewport } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import IotAlertUI from "./IotAlertUI";
import SampleApp from "common/SampleApp";

export default class IotAlertApp implements SampleApp {

  public static async fetchElements(imodel: IModelConnection, c: string) {
    const elementMapQuery = `SELECT * FROM ProcessPhysical.${c}`;
    return this._executeQuery(imodel, elementMapQuery);
  }

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <IotAlertUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown() {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearHiddenElements(vp);
    emph.clearIsolatedElements(vp);
    emph.clearOverriddenElements(vp);
  }

  private static _executeQuery = async (imodel: IModelConnection, query: string) => {
    const rows = [];
    for await (const row of imodel.query(query))
      rows.push(row);
    return rows;
  }
}

abstract class EmphasizeActionBase {
  protected abstract execute(emph: EmphasizeElements, vp: ScreenViewport): boolean;

  public run(blinkingElementSet: string[], elementNameIdMap: Map<string, string>): boolean {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp) {
      return false;
    }

    if (vp) {
      const ids = new Set<string>();
      for (const [key, value] of elementNameIdMap) {
        for (const element of blinkingElementSet) {
          if (key === element) {
            ids.add(value);
          }
        }
      }
      vp.view.iModel.selectionSet.replace(ids);
    }

    const emph = EmphasizeElements.getOrCreate(vp);
    return this.execute(emph, vp);
  }
}
export class OverrideAction extends EmphasizeActionBase {
  private _colorValue: ColorDef;

  public constructor(colorValue: ColorDef) {
    super();
    this._colorValue = colorValue;
  }

  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.overrideSelectedElements(vp, this._colorValue, FeatureOverrideType.ColorOnly, false, false);
    return true;
  }
}

export class ClearOverrideAction extends EmphasizeActionBase {
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.clearOverriddenElements(vp);
    return true;
  }
}
