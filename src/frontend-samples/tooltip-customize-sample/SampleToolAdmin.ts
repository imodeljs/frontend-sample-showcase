/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../common/samples-common.scss";
import { HitDetail, imageElementFromUrl } from "@bentley/imodeljs-frontend";
import { ProxyToolAdmin } from "../../api/showcasetooladmin";
import { ElemProperty, TooltipCustomizeSettings } from "./TooltipCustomizeApp";

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

    const tip = document.createElement("div") as HTMLDivElement;
    let needHR = false;
    if (this.settings.showImage) {
      const img = await imageElementFromUrl(".\\iModeljs-logo.png");
      tip.appendChild(img);
      needHR = true;
    }

    if (this.settings.showCustomText) {
      if (needHR)
        tip.appendChild(document.createElement("hr"));
      const customText = document.createElement("span") as HTMLSpanElement;
      customText.innerHTML = this.settings.customText;
      tip.appendChild(customText);
      needHR = true;
    }

    if (this.settings.showElementProperty) {
      if (needHR)
        tip.appendChild(document.createElement("hr"));

      const propertyName = this.settings.elemProperty as string;
      let msg = "<b>" + propertyName + ":</b> ";

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
              msg += "<li><b>x:</b> " + row.val.x + "</li>";
              msg += "<li><b>y:</b> " + row.val.y + "</li>";
              msg += "<li><b>z:</b> " + row.val.z + "</li>";
              msg += "</ul>";
              break;
          }
        }
      }

      const htmlTip = document.createElement("span") as HTMLSpanElement;
      htmlTip.innerHTML = msg;
      tip.appendChild(htmlTip);
      needHR = true;
    }

    if (this.settings.showDefaultToolTip) {
      if (needHR)
        tip.appendChild(document.createElement("hr"));
      let defaultTip = await super.getToolTip(hit);
      if (typeof defaultTip === "string") {
        const htmlTip = document.createElement("span") as HTMLSpanElement;
        htmlTip.innerHTML = defaultTip;
        defaultTip = htmlTip;
      }
      tip.appendChild(defaultTip);
    }

    return tip;
  }
}

/* Notes on use of ProxyToolAdmin:
*   When the user hovers over an element the tooltip's content is generated by the app's ToolAdmin.
*   ToolAdmins are registered at application start by setting the IModelAppOptions.toolAdmin property
*   and passing to the method iModelApp.startup.
*
*   This code cannot use that standard method because it runs as part of a suite of samples.  Instead,
*   the suite registers a ToolAdmin and allows this sample code to supply a proxy object to do the
*   tooltip generation.
*
*   You do NOT need to create a proxy tool admin for your own app.  To do tooltip customization
*   please follow the instructions in-line above which are summarized here:
*
*     1. Your app's tool admin should extend ToolAdmin and not ProxyToolAdmin.
*           class YourToolAdmin extends ToolAdmin
*     2. Your app should pass your tool admin to the startup call as follows:
*           IModelApp.startup({toolAdmin: new YourToolAdmin});
*     3. Your tool admin should override the method getToolTip as above.
*           public async getToolTip(hit: HitDetail): Promise<HTMLElement | string> {
*             // custom logic here
*           }
*     4. You can access your tool admin through the IModelApp global as follows:
*           IModelApp.toolAdmin as YourToolAdmin
*/
