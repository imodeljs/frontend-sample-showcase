/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "common/samples-common.scss";
import { EmphasizeElements, FeatureOverrideType, IModelApp, OutputMessagePriority, ViewChangeOptions, Viewport } from "@bentley/imodeljs-frontend";
import { ColorDef } from "@bentley/imodeljs-common";
import IotAlertUI from "./IotAlertUI";
import SampleApp from "common/SampleApp";
import { ReactMessage, UnderlinedButton } from "@bentley/ui-core";
import { Id64String } from "@bentley/bentleyjs-core";
import { MessageManager, ReactNotifyMessageDetails } from "@bentley/ui-framework";

export default class IotAlertApp implements SampleApp {
  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <IotAlertUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static showAlertNotification(selectedElement: string, elementNameIdMap: Map<string, string>) {
    MessageManager.outputMessage(new ReactNotifyMessageDetails(OutputMessagePriority.Warning, ``, IotAlertApp.reactMessage(selectedElement, elementNameIdMap)));
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
}

export class BlinkingEffect {
  private static _overrideON = true;
  private static _ids = new Set<Id64String>();

  public static doBlink = (ids: Set<Id64String>) => {
    for (const id of ids) {
      BlinkingEffect._ids.add(id);
    }
    const vp = IModelApp.viewManager.selectedView;
    if (undefined === vp) {
      return;
    }
    const emph = EmphasizeElements.getOrCreate(vp);
    BlinkingEffect._overrideON = true;
    const timer = setInterval(() => {
      setTimeout(() => {
        emph.overrideElements(BlinkingEffect._ids, vp, ColorDef.white, FeatureOverrideType.ColorOnly, false);
      }, 1000);

      setTimeout(() => {
        emph.clearOverriddenElements(vp);
      }, 2000);

      if (!BlinkingEffect._overrideON) {
        clearInterval(timer);
      }
    }, 2000);
  }

  public static stopBlinking(ids: Set<Id64String>) {
    BlinkingEffect._ids.clear();
    if (ids.size === 0) {
      BlinkingEffect._overrideON = false;
    } else {
      for (const id of ids) {
        BlinkingEffect._ids.add(id);
      }
    }
  }
}
