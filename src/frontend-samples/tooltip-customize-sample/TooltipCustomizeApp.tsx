/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { TooltipCustomizeUI } from "./TooltipCustomizeUI";
import { SampleToolAdmin } from "./SampleToolAdmin";
import { ShowcaseToolAdmin } from "../../api/showcasetooladmin";

export enum ElemProperty {
  Origin = "Origin",
  LastModified = "LastMod",
  CodeValue = "CodeValue",
}

export interface TooltipCustomizeSettings {
  showImage: boolean;
  showCustomText: boolean;
  showElementProperty: boolean;
  showDefaultToolTip: boolean;
  customText: string;
  elemProperty: ElemProperty;
}

export default class TooltipCustomizeApp {
  public static settings: TooltipCustomizeSettings = {
    showImage: true,
    showCustomText: false,
    showElementProperty: true,
    showDefaultToolTip: true,
    customText: "Sample custom string",
    elemProperty: ElemProperty.Origin,
  };

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    // ToolAdmin is typically initialized at application start.
    // See Notes at bottom of this file.
    ShowcaseToolAdmin.get().setProxyToolAdmin(new SampleToolAdmin());
    return <TooltipCustomizeUI iModelName={iModelName} iModelSelector={iModelSelector} />;
  }

  public static teardown() {
    ShowcaseToolAdmin.get().clearProxyToolAdmin();
  }
}
