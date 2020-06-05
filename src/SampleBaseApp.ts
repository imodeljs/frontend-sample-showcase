/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ClientRequestContext, Config, Id64String } from "@bentley/bentleyjs-core";
import { BrowserAuthorizationClientConfiguration, BrowserAuthorizationClient, BrowserAuthorizationCallbackHandler } from "@bentley/frontend-authorization-client";
import { UrlDiscoveryClient } from "@bentley/itwin-client";
import { IModelApp, FrontendRequestContext, IModelAppOptions, IModelConnection, TileAdmin } from "@bentley/imodeljs-frontend";
import { BentleyCloudRpcManager, BentleyCloudRpcParams, IModelReadRpcInterface, IModelTileRpcInterface } from "@bentley/imodeljs-common";
import { PresentationRpcInterface } from "@bentley/presentation-common";
import { Presentation } from "@bentley/presentation-frontend";
import { UiFramework } from "@bentley/ui-framework";
import { ShowcaseToolAdmin } from "./api/showcasetooladmin";
import { ShowcaseNotificationManager } from "./api/Notifications/NotificationManager";
import { AppState, AppStore } from "./AppState";
import { AppUi } from "./Components/App/AppUi";

// Boiler plate code
export interface SampleContext {
  imodel: IModelConnection;
  viewDefinitionId: Id64String;
}

export class SampleBaseApp {
  public static get oidcClient() { return IModelApp.authorizationClient as BrowserAuthorizationClient; }
  private static _appState: AppState;
  public static get store(): AppStore { return this._appState.store; }

  public static async startup() {

    const opts: IModelAppOptions = {
      tileAdmin: TileAdmin.create({ useProjectExtents: false }),
      notifications: new ShowcaseNotificationManager(),
      toolAdmin: ShowcaseToolAdmin.initialize(),
    };

    this._appState = new AppState();

    await IModelApp.startup(opts);

    // initialize OIDC
    await SampleBaseApp.initializeOidc();

    // contains various initialization promises which need
    // to be fulfilled before the app is ready
    const initPromises = new Array<Promise<any>>();

    // initialize RPC communication
    initPromises.push(SampleBaseApp.initializeRpc());

    // initialize UiFramework
    initPromises.push(UiFramework.initialize(this.store, IModelApp.i18n));

    // initialize Presentation
    initPromises.push(Presentation.initialize({
      activeLocale: IModelApp.i18n.languageList()[0],
    }));

    // the app is ready when all initialization promises are fulfilled
    await Promise.all(initPromises);
    AppUi.initialize();

  }

  private static async initializeRpc(): Promise<void> {
    const rpcInterfaces = [IModelReadRpcInterface, IModelTileRpcInterface, PresentationRpcInterface];

    // initialize RPC for web apps
    let rpcParams: BentleyCloudRpcParams;

    const urlClient = new UrlDiscoveryClient();
    const requestContext = new FrontendRequestContext();
    const orchestratorUrl = await urlClient.discoverUrl(requestContext, "iModelJsOrchestrator.K8S", undefined);
    rpcParams = { info: { title: "general-purpose-imodeljs-backend", version: "v2.0" }, uriPrefix: orchestratorUrl };

    BentleyCloudRpcManager.initializeClient(rpcParams, rpcInterfaces);
  }

  private static async initializeOidc() {
    // Gather configuration out of the environment
    const clientId = Config.App.get("imjs_frontend_sample_client_id", "imodeljs-spa-samples-2686");
    const redirectUri = Config.App.get("imjs_frontend_sample_redirect_uri", "http://localhost:3000/signin-callback.html");
    const scope = Config.App.get("imjs_frontend_sample_scope", "openid email profile organization imodelhub context-registry-service:read-only product-settings-service general-purpose-imodeljs-backend imodeljs-router");
    const responseType = "code";
    const oidcConfig: BrowserAuthorizationClientConfiguration = { clientId, redirectUri, scope, responseType };

    await BrowserAuthorizationCallbackHandler.handleSigninCallback(oidcConfig.redirectUri);

    // Setup the IModelApp authorization client
    IModelApp.authorizationClient = new BrowserAuthorizationClient(oidcConfig);

    try {
      await SampleBaseApp.oidcClient.signInSilent(new ClientRequestContext());
    } catch (err) { }
  }
}
