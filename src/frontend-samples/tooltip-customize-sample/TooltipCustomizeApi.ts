/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { HitDetail, imageElementFromUrl, ToolAdmin } from "@itwin/core-frontend";

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

/** To create the tooltip, a class needs to override ToolAdmin and getToolTip() */
class ShowcaseToolAdmin extends ToolAdmin {
  public settings: TooltipCustomizeSettings = {
    showImage: true,
    showCustomText: false,
    showElementProperty: true,
    showDefaultToolTip: true,
    customText: "Additional custom text",
    elemProperty: ElemProperty.Origin,
  };

  public constructor() {
    super();
  }

  public async getToolTip(hit: HitDetail): Promise<HTMLElement | string> {
    if (!this.settings.showImage && !this.settings.showCustomText && !this.settings.showElementProperty && !this.settings.showDefaultToolTip)
      return "";

    const tip = document.createElement("div");
    let needHR = false;
    if (this.settings.showImage) {
      const img = await imageElementFromUrl(".\\itwinjs-logo.svg");
      tip.appendChild(img);
      needHR = true;
    }

    if (this.settings.showCustomText) {
      if (needHR)
        tip.appendChild(document.createElement("hr"));
      const customText = document.createElement("span");
      customText.innerHTML = this.settings.customText;
      tip.appendChild(customText);
      needHR = true;
    }

    if (this.settings.showElementProperty) {
      if (needHR)
        tip.appendChild(document.createElement("hr"));

      const propertyName = this.settings.elemProperty as string;
      let msg = `<b>${propertyName}:</b> `;

      if (hit.isElementHit) {
        const query = `SELECT ${propertyName} AS val FROM BisCore.SpatialElement
                       WHERE ECInstanceId = ${hit.sourceId}`;

        const rows = hit.viewport.iModel.query(query);
        for await (const row of rows) {
          switch (this.settings.elemProperty) {
            default:
              msg += row[0];
              break;
            case ElemProperty.LastModified:
              const date = new Date(row[0]);
              msg += date.toLocaleString();
              break;
            case ElemProperty.Origin:
              msg += "<ul>";
              msg += `<li><b>x:</b> ${row[0].X}</li>`;
              msg += `<li><b>y:</b> ${row[0].Y}</li>`;
              msg += `<li><b>z:</b> ${row[0].Z}</li>`;
              msg += "</ul>";
              break;
          }
        }
      }

      const htmlTip = document.createElement("span");
      htmlTip.innerHTML = msg;
      tip.appendChild(htmlTip);
      needHR = true;
    }

    if (this.settings.showDefaultToolTip) {
      if (needHR)
        tip.appendChild(document.createElement("hr"));
      let defaultTip = await super.getToolTip(hit);
      if (typeof defaultTip === "string") {
        const htmlTip = document.createElement("span");
        htmlTip.innerHTML = defaultTip;
        defaultTip = htmlTip;
      }
      tip.appendChild(defaultTip);
    }
    return tip;
  }
}

export const toolAdmin = new ShowcaseToolAdmin();
