/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthStatus, BeEvent, BentleyError, ClientRequestContext, Config } from "@bentley/bentleyjs-core";
import { AccessToken } from "@bentley/itwin-client";
import { FrontendAuthorizationClient } from "@bentley/frontend-authorization-client";

export class AuthorizationClient implements FrontendAuthorizationClient {
  public readonly onUserStateChanged: BeEvent<(token: AccessToken | undefined) => void>;
  protected _accessToken?: AccessToken;

  private static _oidcClient: FrontendAuthorizationClient;

  public static get oidcClient(): FrontendAuthorizationClient {
    return this._oidcClient;
  }

  private static _initialized: boolean = false;

  constructor() {
    this.onUserStateChanged = new BeEvent();
  }

  public static async initializeOidc(): Promise<void> {
    if (!AuthorizationClient._initialized) {
      const authClient = new AuthorizationClient();
      const userURL = Config.App.get("imjs_sample_showcase_user", "https://prod-imodeldeveloperservices-eus.azurewebsites.net/api/v0/sampleShowcaseUser/devUser");
      await authClient.generateTokenString(userURL, new ClientRequestContext());
      await authClient.signInSilent(new ClientRequestContext());

      AuthorizationClient._oidcClient = authClient;
    }
    AuthorizationClient._initialized = true;
  }

  public async signInSilent(requestContext?: ClientRequestContext): Promise<void> {
    this.signIn(requestContext)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error.message);
      });
  }

  public async signIn(requestContext?: ClientRequestContext): Promise<void> {
    if (requestContext) {
      requestContext.enter();
    }
    await this.getAccessToken();
  }

  public async signOut(requestContext?: ClientRequestContext): Promise<void> {
    if (requestContext) {
      requestContext.enter();
    }
    this._accessToken = undefined;
  }

  public get isAuthorized(): boolean {
    return this.hasSignedIn;
  }

  public get hasExpired(): boolean {
    return !this._accessToken;
  }

  public get hasSignedIn(): boolean {
    return !!this._accessToken;
  }

  public async generateTokenString(userURL: string, requestContext?: ClientRequestContext) {
    if (requestContext) {
      requestContext.enter();
    }

    const response = await fetch(userURL);
    const body = await response.json();
    const tokenJson = {
      startsAt: body._startsAt,
      expiresAt: body._expiresAt,
      tokenString: body._jwt,
    };
    this._accessToken = AccessToken.fromJson(tokenJson);

    // Automatically renew if session exceeds 55 minutes.
    setTimeout(() => {
      this.generateTokenString(userURL)
        .catch((error) => {
          throw new BentleyError(AuthStatus.Error, error);
        });
    }, (1000 * 60 * 55));
  }

  public async getAccessToken(): Promise<AccessToken> {
    if (!this._accessToken)
      throw new BentleyError(AuthStatus.Error, "Cannot get access token");

    return this._accessToken;
  }
}
