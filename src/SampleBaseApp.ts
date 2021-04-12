/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { ClientRequestContext, Config, Id64String } from "@bentley/bentleyjs-core";
import { /* BrowserAuthorizationCallbackHandler */ BrowserAuthorizationClient /* BrowserAuthorizationClientConfiguration */ } from "@bentley/frontend-authorization-client";
import { UrlDiscoveryClient } from "@bentley/itwin-client";
import { FrontendRequestContext, IModelApp, IModelAppOptions, IModelConnection } from "@bentley/imodeljs-frontend";
import { BentleyCloudRpcManager, IModelReadRpcInterface, IModelTileRpcInterface } from "@bentley/imodeljs-common";
import { MarkupApp } from "@bentley/imodeljs-markup";
import { PresentationRpcInterface } from "@bentley/presentation-common";
import { Presentation } from "@bentley/presentation-frontend";
import { ShowcaseToolAdmin } from "./api/showcasetooladmin";
import { ShowcaseNotificationManager } from "./api/Notifications/NotificationManager";
import { NoSignInIAuthClient } from "./NoSignInIAuthClient";
import { FrameworkReducer, StateManager, UiFramework } from "@bentley/ui-framework";

// Boiler plate code
export interface SampleContext {
  imodel: IModelConnection;
  viewDefinitionId: Id64String;
}

export class SampleBaseApp {
  private static _appStateManager: StateManager | undefined;

  public static get oidcClient() { return IModelApp.authorizationClient as BrowserAuthorizationClient; }
  public static async startup(signal: AbortSignal, options?: IModelAppOptions) {

    const opts: IModelAppOptions = Object.assign({
      tileAdmin: { useProjectExtents: false },
      notifications: new ShowcaseNotificationManager(),
      toolAdmin: ShowcaseToolAdmin.initialize(),
    }, options);

    if (signal.aborted) {
      Promise.reject(new DOMException("Aborted", "Abort"));
    }
    await IModelApp.startup(opts);

    if (signal.aborted) {
      Promise.reject(new DOMException("Aborted", "Abort"));
    }
    // initialize OIDC
    await SampleBaseApp.initializeOidc();

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
    initPromises.push(SampleBaseApp.initializeRpc());

    // initialize UiFramework
    initPromises.push(UiFramework.initialize(undefined));

    // initialize Presentation
    initPromises.push(Presentation.initialize({
      activeLocale: IModelApp.i18n.languageList()[0],
    }));

    // initialize Markup
    initPromises.push(MarkupApp.initialize());

    if (signal.aborted) {
      Promise.reject(new DOMException("Aborted", "Abort"));
    }
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

  private static async initializeOidc() {
    // Gather configuration out of the environment
    /*  Uncomment this block to enable signin.
    const clientId = Config.App.get("imjs_frontend_sample_client_id", "imodeljs-spa-samples-2686");
    const redirectUri = Config.App.get("imjs_frontend_sample_redirect_uri", "http://localhost:3000/signin-callback.html");
    const scope = Config.App.get("imjs_frontend_sample_scope", "openid email profile organization imodelhub context-registry-service:read-only product-settings-service general-purpose-imodeljs-backend imodeljs-router");
    const responseType = "code";
    const oidcConfig: BrowserAuthorizationClientConfiguration = { clientId, redirectUri, scope, responseType };
    await BrowserAuthorizationCallbackHandler.handleSigninCallback(oidcConfig.redirectUri);
    // Setup the IModelApp authorization client
    IModelApp.authorizationClient = new BrowserAuthorizationClient(oidcConfig); ..
    */

    // Comment this block to disable no-signin.
    const authClient = new NoSignInIAuthClient();
    const userURL = Config.App.get("imjs_sample_showcase_user", "https://prod-imodeldeveloperservices-eus.azurewebsites.net/api/v0/sampleShowcaseUser");
    await authClient.generateTokenString(userURL, new ClientRequestContext());
    IModelApp.authorizationClient = authClient;

    try {
      await SampleBaseApp.oidcClient.signInSilent(new ClientRequestContext());
    } catch (err) { }
  }
}
