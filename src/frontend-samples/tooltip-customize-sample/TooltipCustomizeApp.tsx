/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import "common/samples-common.scss";
import { ProxyToolAdmin } from "api/showcasetooladmin";
import { ElemProperty, TooltipCustomizeSettings } from "./TooltipCustomizeUI";
import { HitDetail, imageElementFromUrl } from "@bentley/imodeljs-frontend";

// SampleToolAdmin would typically extend ToolAdmin
//  See Notes on use of ProxyToolAdmin at the bottom of this file.
//  Do this: "class YourToolAdmin extends ToolAdmin"
export class SampleToolAdmin extends ProxyToolAdmin {
  public settings: TooltipCustomizeSettings = {
    showImage: true,
    showCustomText: false,
    showElementProperty: true,
    showDefaultToolTip: true,
    customText: "Sample custom string",
    elemProperty: ElemProperty.Origin,
  };

  public async getToolTip(hit: HitDetail): Promise<HTMLElement | string> {

    if (!this.settings.showImage && !this.settings.showCustomText && !this.settings.showElementProperty && !this.settings.showDefaultToolTip)
      return "";

    const tip = document.createElement("div");
    let needHR = false;
    if (this.settings.showImage) {
      const img = await imageElementFromUrl(".\\iModeljs-logo.png");
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
              msg += row.val;
              break;
            case ElemProperty.LastModified:
              const date = new Date(row.val);
              msg += date.toLocaleString();
              break;
            case ElemProperty.Origin:
              msg += "<ul>";
              msg += `<li><b>x:</b> ${row.val.x}</li>`;
              msg += `<li><b>y:</b> ${row.val.y}</li>`;
              msg += `<li><b>z:</b> ${row.val.z}</li>`;
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
