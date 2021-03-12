/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { AuthStatus, BeEvent, BentleyError, ClientRequestContext } from "@bentley/bentleyjs-core";
import { AccessToken } from "@bentley/itwin-client";
import { FrontendAuthorizationClient } from "@bentley/frontend-authorization-client";

export class NoSignInIAuthClient implements FrontendAuthorizationClient {
  public readonly onUserStateChanged: BeEvent<(token: AccessToken | undefined) => void>;
  protected _accessToken?: AccessToken;
  protected _devAccessToken?: AccessToken;

  constructor() {
    this.onUserStateChanged = new BeEvent();
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
      ...await body,
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _userInfo: { id: "MockId" },
      // eslint-disable-next-line @typescript-eslint/naming-convention
      _tokenString: body._jwt,
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
      const response = await fetch("https://qa-imodeldeveloperservices-eus.azurewebsites.net/api/v0/sampleShowcaseUser/devUser");
      const body = await response.json();
      const tokenJson = {
        ...await body,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _userInfo: { id: "MockId" },
        // eslint-disable-next-line @typescript-eslint/naming-convention
        _tokenString: body._jwt,
      };
      this._devAccessToken = AccessToken.fromJson(tokenJson);
    }

    setTimeout(() => {
      this.getDevAccessToken()
        .catch((error) => {
          throw new BentleyError(AuthStatus.Error, error);
        });
    }, (1000 * 60 * 55));

    return this._devAccessToken!;
  }
}
