/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ToolAdmin, HitDetail } from "@bentley/imodeljs-frontend";

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
  private static singleton: ShowcaseToolAdmin;
  private proxy: ProxyToolAdmin | null;

  public static initialize(): ShowcaseToolAdmin {
    ShowcaseToolAdmin.singleton = new ShowcaseToolAdmin();
    return ShowcaseToolAdmin.singleton;
  }

  public static get(): ShowcaseToolAdmin {
    return ShowcaseToolAdmin.singleton;
  }

  private constructor() {
    super();
    this.proxy = null;
  }

  public setProxyToolAdmin(proxy: ProxyToolAdmin) {
    this.proxy = proxy;
  }

  public clearProxyToolAdmin() {
    const oldProxy = this.proxy;
    this.proxy = null;
    return oldProxy;
  }

  public getProxyToolAdmin(): ProxyToolAdmin | null {
    return this.proxy;
  }

  public async getToolTip(hit: HitDetail): Promise<HTMLElement | string> {
    if (null != this.proxy)
      return this.proxy.getToolTip(hit);

    return super.getToolTip(hit);
  }
}
