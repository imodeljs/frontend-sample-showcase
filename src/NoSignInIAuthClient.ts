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
    const tokenJson = {
      ...await response.json(),
      _userInfo: { id: "MockId" },
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
