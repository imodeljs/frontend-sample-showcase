/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { HitDetail, ToolAdmin } from "@bentley/imodeljs-frontend";

type GetToolTipFunc = (hit: HitDetail) => Promise<HTMLElement | string>;

export class ProxyToolAdmin {
  public async getToolTip(hit: HitDetail): Promise<HTMLElement | string> {
    const suspendProxy = ShowcaseToolAdmin.get().clearProxyToolAdmin();
    const tooltip = ShowcaseToolAdmin.get().getToolTip(hit);
    if (null != suspendProxy)
      ShowcaseToolAdmin.get().setProxyToolAdmin(suspendProxy);
    return tooltip;
  }
}

export class ShowcaseToolAdmin extends ToolAdmin {
  private static _singleton: ShowcaseToolAdmin;
  private _proxy: ProxyToolAdmin | null;

  public static initialize(): ShowcaseToolAdmin {
    ShowcaseToolAdmin._singleton = new ShowcaseToolAdmin();
    return ShowcaseToolAdmin._singleton;
  }

  public static get(): ShowcaseToolAdmin {
    return ShowcaseToolAdmin._singleton;
  }

  private constructor() {
    super();
    this._proxy = null;
  }

  public setProxyToolAdmin(proxy: ProxyToolAdmin) {
    this._proxy = proxy;
  }

  public clearProxyToolAdmin() {
    const oldProxy = this._proxy;
    this._proxy = null;
    return oldProxy;
  }

  public getProxyToolAdmin(): ProxyToolAdmin | null {
    return this._proxy;
  }

  public async getToolTip(hit: HitDetail): Promise<HTMLElement | string> {
    if (null != this._proxy)
      return this._proxy.getToolTip(hit);

    return super.getToolTip(hit);
  }
}
