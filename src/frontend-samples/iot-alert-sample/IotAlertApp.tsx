/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { EmphasizeElements, FeatureOverrideType, IModelApp, ViewChangeOptions } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import IotAlertUI from "./IotAlertUI";
import SampleApp from "common/SampleApp";
import { ReactMessage, UnderlinedButton } from "@bentley/ui-core";

export default class IotAlertApp implements SampleApp {
  private static wantEmphasis = false;
  public static setEmphasis(wantEmphasis: boolean) {
    IotAlertApp.wantEmphasis = wantEmphasis;
  }
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <IotAlertUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static reactMessage(element: string, elementNameIdMap: Map<string, string>): ReactMessage {
    const reactNode = (
      <span>
        Alert! There is an issue with <UnderlinedButton onClick={async () => IotAlertApp._zoomToElements(element, elementNameIdMap)}>{element}</UnderlinedButton>
      </span>
    );
    return ({ reactNode });
  }

  public static _zoomToElements = async (id: string, elementNameIdMap: Map<string, string>) => {
    const viewChangeOpts: ViewChangeOptions = {};
    viewChangeOpts.animateFrustumChange = true;
    const vp = IModelApp.viewManager.selectedView!;
    const ids = new Set<string>();
    for (const [key, value] of elementNameIdMap) {
      if (key === id) {
        ids.add(value);
      }
    }
    await vp.zoomToElements(ids, { ...viewChangeOpts });
  }

  public static teardown() {
    const vp = IModelApp.viewManager.selectedView;

    if (undefined === vp)
      return;

    const emph = EmphasizeElements.getOrCreate(vp);
    emph.clearEmphasizedElements(vp);
    emph.clearOverriddenElements(vp);
  }

  public static OverrideAction(blinkingElementSet: string[], elementNameIdMap: Map<string, string>): boolean {
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

      vp.view.iModel.selectionSet.add(ids);
    }
    const emph = EmphasizeElements.getOrCreate(vp);
    return emph.overrideSelectedElements(vp, ColorDef.white, FeatureOverrideType.ColorOnly, false, false);
  }

  public static ClearOverrideAction(blinkingElementSet: string[], elementNameIdMap: Map<string, string>): boolean {
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

      vp.view.iModel.selectionSet.emptyAll();
    }
    const emph = EmphasizeElements.getOrCreate(vp);
    return emph.clearOverriddenElements(vp);
  }

  public static doBlinking = (blinkingElementSet: string[], elementNameIdMap: Map<string, string>) => {
    const timer = setInterval(() => {
      setTimeout(() => {
        IotAlertApp.OverrideAction(blinkingElementSet, elementNameIdMap);
      }, 1000);

      setTimeout(() => {
        IotAlertApp.ClearOverrideAction(blinkingElementSet, elementNameIdMap);
      }, 2000);

      if (!IotAlertApp.wantEmphasis) {
        clearInterval(timer);
      }
    }, 2000);
  }
}
