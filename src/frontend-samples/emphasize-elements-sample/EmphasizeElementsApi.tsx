/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "common/samples-common.scss";
import { EmphasizeElements, FeatureOverrideType, ScreenViewport } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";

export class EmphasizeElementsApi {

  // START EMPHASIZE
  public static emphasizeSelectedElements(wantEmphasis: boolean, vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.wantEmphasis = wantEmphasis;
    emph.emphasizeSelectedElements(vp);
  }

  public static clearEmphasizedElements(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
  }
  // END EMPHASIZE

  // START HIDE
  public static hideSelectedElements(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.hideSelectedElements(vp);
  }

  public static clearHiddenElements(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearHiddenElements(vp);
  }
  // END HIDE

  // START ISOLATE
  public static isolateSelectedElements(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.isolateSelectedElements(vp);
  }

  public static clearIsolatedElements(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearIsolatedElements(vp);
  }
  // END ISOLATE

  // START OVERRIDE
  public static overrideSelectedElements(colorValue: ColorDef, vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.overrideSelectedElements(vp, colorValue, FeatureOverrideType.ColorOnly, false, true);
  }

  public static clearOverriddenElements(vp: ScreenViewport) {
    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearOverriddenElements(vp);
  }
  // END OVERRIDE
}
