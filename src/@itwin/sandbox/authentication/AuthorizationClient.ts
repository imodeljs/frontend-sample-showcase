/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { ViewerAuthorizationClient } from "@itwin/web-viewer-react";
import { AccessToken, AuthStatus, BeEvent, BentleyError } from "@itwin/core-bentley";

interface AccessTokenObject {
  startsAt: Date;
  expiresAt: Date;
  tokenString: string;
}

export default class SandboxAuthorizationClient implements ViewerAuthorizationClient {
  private _accessToken?: AccessTokenObject;
  private static _userUrl = "https://prod-imodeldeveloperservices-eus.azurewebsites.net/api/v0/sampleShowcaseUser/devUser";
  private static _oidcClient: ViewerAuthorizationClient;

  public static get oidcClient(): ViewerAuthorizationClient {
    return this._oidcClient;
  }

  public readonly onAccessTokenChanged = new BeEvent<(token: AccessToken | undefined) => void>();

  public get isAuthorized(): boolean {
    return !!this._accessToken;
  }

  public get hasExpired(): boolean {
    return !!this._accessToken && this._accessToken.expiresAt < new Date(Date.now());
  }

  public get hasSignedIn(): boolean {
    return !!this._accessToken;
  }

  private async generateTokenString(userURL: string) {

    const response = await fetch(userURL);
    const body = await response.json();
    const tokenJson = {
      startsAt: new Date(body._startsAt),
      expiresAt: new Date(body._expiresAt),
      tokenString: body._jwt,
    };

    this._accessToken = tokenJson;

    this.onAccessTokenChanged.raiseEvent(body._jwt);

    // Automatically renew if session exceeds 55 minutes.
    setTimeout(() => {
      this.generateTokenString(userURL)
        .catch((error) => {
          this.onAccessTokenChanged.raiseEvent(undefined);
          throw new BentleyError(AuthStatus.Error, error);
        });
    }, (1000 * 60 * 55));
  }

  /** initialize from existing user */
  public static initializeOidc = async () => {
    const authClient = new SandboxAuthorizationClient();
    await authClient.generateTokenString(SandboxAuthorizationClient._userUrl);
    SandboxAuthorizationClient._oidcClient = authClient;
  };

  /** Returns a promise that resolves to the AccessToken of the currently authorized user*/
  public getAccessToken = async (): Promise<string> => {
    // if not currently authorized, attempt a silent signin
    if (!this.isAuthorized || this.hasExpired) {
      await this.generateTokenString(SandboxAuthorizationClient._userUrl);
    }
    if (this._accessToken) {
      return `Bearer ${this._accessToken.tokenString}`;
    }
    return "";
  };
}
