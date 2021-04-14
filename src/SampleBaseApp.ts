/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { Id64String } from "@bentley/bentleyjs-core";
import { /* BrowserAuthorizationCallbackHandler */ BrowserAuthorizationClient /* BrowserAuthorizationClientConfiguration */ } from "@bentley/frontend-authorization-client";
import { UrlDiscoveryClient } from "@bentley/itwin-client";
import { FrontendRequestContext, IModelApp, IModelAppOptions, IModelConnection } from "@bentley/imodeljs-frontend";
import { BentleyCloudRpcManager, IModelReadRpcInterface, IModelTileRpcInterface } from "@bentley/imodeljs-common";
import { MarkupApp } from "@bentley/imodeljs-markup";
import { PresentationRpcInterface } from "@bentley/presentation-common";
import { Presentation } from "@bentley/presentation-frontend";
import { ShowcaseToolAdmin } from "./api/showcasetooladmin";
import { ShowcaseNotificationManager } from "./api/Notifications/NotificationManager";
import { FrameworkReducer, StateManager, UiFramework } from "@bentley/ui-framework";
import { AuthorizationClient } from "@itwinjs-sandbox/authentication/AuthorizationClient";

// Boiler plate code
export interface SampleContext {
  imodel: IModelConnection;
  viewDefinitionId: Id64String;
}

const promiseWrapper = async (signal: AbortSignal, promise: () => Promise<void>) => {
  if (signal.aborted) {
    throw new DOMException("Aborted", "Abort");
  }
  await promise();
};

export class SampleBaseApp {
  private static _appStateManager: StateManager | undefined;

  public static get oidcClient() { return IModelApp.authorizationClient as BrowserAuthorizationClient; }
  public static async startup(signal: AbortSignal, options?: IModelAppOptions) {

    const opts: IModelAppOptions = Object.assign({
      tileAdmin: { useProjectExtents: false },
      notifications: new ShowcaseNotificationManager(),
      toolAdmin: ShowcaseToolAdmin.initialize(),
    }, options);

    await promiseWrapper(signal, async () => IModelApp.startup(opts));

    IModelApp.authorizationClient = AuthorizationClient.oidcClient;

    // use new state manager that allows dynamic additions from extensions and snippets
    if (!this._appStateManager) {
      this._appStateManager = new StateManager({
        frameworkState: FrameworkReducer,
      });
    }

    // contains various initialization promises which need
    // to be fulfilled before the app is ready
    const initPromises = new Array<Promise<any>>();

    // initialize RPC communication
    initPromises.push(promiseWrapper(signal, async () => SampleBaseApp.initializeRpc()));

    // initialize UiFramework
    initPromises.push(promiseWrapper(signal, async () => UiFramework.initialize(undefined)));

    // initialize Presentation
    initPromises.push(promiseWrapper(signal, async () => Presentation.initialize({
      activeLocale: IModelApp.i18n.languageList()[0],
    })));

    // initialize Markup
    initPromises.push(promiseWrapper(signal, async () => MarkupApp.initialize()));

    // the app is ready when all initialization promises are fulfilled
    await Promise.all(initPromises);

  }

  private static async initializeRpc(): Promise<void> {
    const rpcInterfaces = [IModelReadRpcInterface, IModelTileRpcInterface, PresentationRpcInterface];

    // initialize RPC for web apps
    const urlClient = new UrlDiscoveryClient();
    const requestContext = new FrontendRequestContext();
    const orchestratorUrl = await urlClient.discoverUrl(requestContext, "iModelJsOrchestrator.K8S", undefined);
    const rpcParams = { info: { title: "general-purpose-imodeljs-backend", version: "v2.0" }, uriPrefix: orchestratorUrl };

    BentleyCloudRpcManager.initializeClient(rpcParams, rpcInterfaces);
  }
}
