/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { EmphasizeElements, FeatureOverrideType, IModelApp, ScreenViewport, IModelConnection, SelectionSetEvent, SelectionSetEventType, Viewport } from "@bentley/imodeljs-frontend";
import { ViewCreator2d } from "frontend-samples/cross-probing-sample/ViewCreator2d";
import { ColorDef } from "@bentley/imodeljs-common";


import EmphasizeElementsUI from "./IotAlertUI";
import SampleApp from "common/SampleApp";

export default class EmphasizeElementsApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <EmphasizeElementsUI iModelName={iModelName} iModelSelector={iModelSelector} />;
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

  // keep track of last element selected (to avoid double clicks).
  private static lastElementSelected: string | undefined;
  // array to keep track of all 3D/2D connections.
  private static elementMap?: any[];

  // add listener to capture element selection events.
  public static addElementSelectionListener(imodel: IModelConnection) {
    imodel.selectionSet.onChanged.addListener(EmphasizeElementsApp.elementSelected);
    console.log(`addElementSelectionListener`);
  }

  // this method is called when an element is selected on a viewport.
  private static elementSelected = async (ev: SelectionSetEvent) => {

    if (EmphasizeElementsApp.elementMap === null) return;

    const sourceElementId = Array.from(ev.set.elements).pop();

    if (ev.type === SelectionSetEventType.Add) return;
    // return if element clicked is same as last element selected
    if (EmphasizeElementsApp.lastElementSelected === sourceElementId) return;
    EmphasizeElementsApp.lastElementSelected = sourceElementId;

    const sourceVp = IModelApp.viewManager.selectedView;
    let targetLink;

    // if source is 3D, look for any target 2D elements.
    if (sourceVp?.view.is3d()) {
      targetLink = EmphasizeElementsApp.elementMap!.filter((link: any) => link.physElementId === sourceElementId);
      if (targetLink.length > 0) {
        const targetElement = targetLink[0].drawElementId;
        const targetModel = await ev.set.iModel.models.getProps(targetLink[0].drawModelId);
        const targetViewState = await new ViewCreator2d(ev.set.iModel).getViewForModel(targetModel[0].id!, targetModel[0].classFullName, { bgColor: ColorDef.black });
        const vp2d = EmphasizeElementsApp._get2DViewport();
        vp2d.onChangeView.addOnce(async () => {
          // when view opens, zoom into target 2D element.
          vp2d.zoomToElements(targetElement, { animateFrustumChange: true });
          ev.set.iModel.hilited.elements.addId(targetElement);
        });
        // if target 2D element found, open its view.
        vp2d?.changeView(targetViewState);
      }
    }

    // if source VP is 2D, look for any target 3D elements.
    if (sourceVp?.view.is2d()) {
      targetLink = EmphasizeElementsApp.elementMap!.filter((link: any) => link.drawElementId === sourceElementId);
      if (targetLink.length > 0) {
        const targetElement = targetLink[0].physElementId;
        // if target 3D element found, zoom into it.
        await EmphasizeElementsApp._get3DViewport().zoomToElements(targetElement, { animateFrustumChange: true });
        ev.set.iModel.hilited.elements.addId(targetElement);
      }
    }

    return sourceElementId;
  }

  // helper function to get 3D viewport.
  private static _get3DViewport(): Viewport {
    let vp3d;
    IModelApp.viewManager.forEachViewport((vp) => (vp.view.is3d()) ? vp3d = vp : null);
    if (!vp3d) throw new Error("No viewport with 3D model found!")
    return vp3d;
  }

  // helper function to get 2D viewport.
  private static _get2DViewport(): Viewport {
    let vp2d;
    IModelApp.viewManager.forEachViewport((vp) => (vp.view.is2d()) ? vp2d = vp : null);
    if (!vp2d) throw new Error("No viewport with 2D model found!")
    return vp2d;
  }
}

abstract class EmphasizeActionBase {
  protected abstract execute(emph: EmphasizeElements, vp: ScreenViewport): boolean;

  public run(): boolean {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp) {
      return false;
    }

    console.log(`EmphasizeActionBase: vp is ${vp}`);

    const emph = EmphasizeElements.getOrCreate(vp);
    let elements = emph.getOverriddenElements();
    //for (let i = 0; i < elements?.size(); ++i) {
    console.log(`EmphasizeActionBase: ${elements?.get(0)}`);
    //}

    console.log(`EmphasizeActionBase: ${emph.getEmphasizedElements(vp)}`)
    return this.execute(emph, vp);
  }
}

export class EmphasizeAction extends EmphasizeActionBase {
  private _wantEmphasis: boolean;

  public constructor(wantEmphasis: boolean) {
    super();
    this._wantEmphasis = wantEmphasis;
  }
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.wantEmphasis = this._wantEmphasis;
    emph.emphasizeSelectedElements(vp);
    return true;
  }
}

export class ClearEmphasizeAction extends EmphasizeActionBase {
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.clearEmphasizedElements(vp);
    return true;
  }
}

export class HideAction extends EmphasizeActionBase {
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.hideSelectedElements(vp);
    return true;
  }
}

export class ClearHideAction extends EmphasizeActionBase {
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.clearHiddenElements(vp);
    return true;
  }
}

export class IsolateAction extends EmphasizeActionBase {
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.isolateSelectedElements(vp);
    return true;
  }
}

export class ClearIsolateAction extends EmphasizeActionBase {
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.clearIsolatedElements(vp);
    return true;
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
    //const obj: any = emph.getOverriddenElements();
    //var setIter = mySet.values();

    // for (const prop in obj) {
    //   console.log(`obj.${prop} = ${obj[prop]}`);
    // }

    //console.log(`OverrideAction: getOverriddenElements - ${mySet}`);
    return true;
  }
}

export class ClearOverrideAction extends EmphasizeActionBase {
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.clearOverriddenElements(vp);
    return true;
  }
}
