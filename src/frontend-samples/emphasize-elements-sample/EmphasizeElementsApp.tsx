/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { EmphasizeElements, IModelApp } from "@bentley/imodeljs-frontend";
import { EmphasizeElementsUI } from "./EmphasizeElementsUI";

export default class EmphasizeElementsApp {
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
}
