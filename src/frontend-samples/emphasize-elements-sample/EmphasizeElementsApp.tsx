/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { EmphasizeElements, FeatureOverrideType, IModelApp, ScreenViewport } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";

import EmphasizeElementsUI from "./EmphasizeElementsUI";
import SampleApp from "common/SampleApp";

export default class EmphasizeElementsApp implements SampleApp {
  public static async setup(iModelName: string, setupControlPane: (instructions: string, controls?: React.ReactNode) => void) {
    return <EmphasizeElementsUI iModelName={iModelName} setupControlPane={setupControlPane} />;
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
}

abstract class EmphasizeActionBase {
  protected abstract execute(emph: EmphasizeElements, vp: ScreenViewport): boolean;

  public run(): boolean {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp) {
      return false;
    }

    const emph = EmphasizeElements.getOrCreate(vp);
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
    emph.overrideSelectedElements(vp, this._colorValue, FeatureOverrideType.ColorOnly, false, true);
    return true;
  }
}

export class ClearOverrideAction extends EmphasizeActionBase {
  public execute(emph: EmphasizeElements, vp: ScreenViewport): boolean {
    emph.clearOverriddenElements(vp);
    return true;
  }
}
