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
  protected _devAccessToken?: AccessToken;

  private static _oidcClient: FrontendAuthorizationClient;

  public static get oidcClient(): FrontendAuthorizationClient {
    return this._oidcClient;
  }

  private static _initialized: boolean = false;

  constructor() {
    this.onUserStateChanged = new BeEvent();
  }

  public static async initializeOidc(): Promise<void> {
    if (!this._initialized) {
      const authClient = new AuthorizationClient();
      const userURL = Config.App.get("imjs_sample_showcase_user", "https://prod-imodeldeveloperservices-eus.azurewebsites.net/api/v0/sampleShowcaseUser");
      await authClient.generateTokenString(userURL, new ClientRequestContext());
      await authClient.signInSilent(new ClientRequestContext());

      this._oidcClient = authClient;
    }
    this._initialized = true;
  }

  public async signInSilent(requestContext?: ClientRequestContext): Promise<void> {
    this.signIn(requestContext);
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

  public async getDevAccessToken(): Promise<AccessToken> {
    if (!this._devAccessToken) {
      const response = await fetch("https://prod-imodeldeveloperservices-eus.azurewebsites.net/api/v0/sampleShowcaseUser/devUser");
      const body = await response.json();
      const tokenJson = {
        ...await body,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _userInfo: { id: "MockId" },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _tokenString: body._jwt,
      };
      this._devAccessToken = AccessToken.fromJson(tokenJson);

      setTimeout(() => {
        // Reset the token.
        this._devAccessToken = undefined;
        this.getDevAccessToken()
          .catch((error) => {
            throw new BentleyError(AuthStatus.Error, error);
          });
      }, (1000 * 60 * 55));
    }

    return this._devAccessToken;
  }
}
