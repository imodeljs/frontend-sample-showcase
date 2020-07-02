/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { HitDetail, ToolAdmin } from "@bentley/imodeljs-frontend";
export declare class ProxyToolAdmin {
    getToolTip(hit: HitDetail): Promise<HTMLElement | string>;
}
export declare class ShowcaseToolAdmin extends ToolAdmin {
    private static _singleton;
    private _proxy;
    static initialize(): ShowcaseToolAdmin;
    static get(): ShowcaseToolAdmin;
    private constructor();
    setProxyToolAdmin(proxy: ProxyToolAdmin): void;
    clearProxyToolAdmin(): ProxyToolAdmin;
    getProxyToolAdmin(): ProxyToolAdmin | null;
    getToolTip(hit: HitDetail): Promise<HTMLElement | string>;
}
