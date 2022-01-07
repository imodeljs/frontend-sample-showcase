/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import { BrowserAuthorizationClient } from "@itwin/browser-authorization";
import { AccessToken, AuthStatus, BeEvent, BentleyError } from "@itwin/core-bentley";
import { AuthorizationClient } from "@itwin/core-common";

interface AccessTokenObject {
  startsAt: Date;
  expiresAt: Date;
  tokenString: string;
}

export default class ShowcaseAuthorizationClient implements AuthorizationClient {
  private _accessToken?: AccessTokenObject;
  private static _userUrl = "https://prod-imodeldeveloperservices-eus.azurewebsites.net/api/v0/sampleShowcaseUser/devUser";
  private static _oidcClient: AuthorizationClient;

  public static get oidcClient(): BrowserAuthorizationClient {
    return this._oidcClient as BrowserAuthorizationClient;
  }

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
    const authClient = new ShowcaseAuthorizationClient();
    await authClient.generateTokenString(ShowcaseAuthorizationClient._userUrl);
    ShowcaseAuthorizationClient._oidcClient = authClient;
  };

  /** Returns a promise that resolves to the AccessToken of the currently authorized user*/
  public getAccessToken = async (): Promise<string> => {
    // if not currently authorized, attempt a silent signin
    if (!this.isAuthorized || this.hasExpired) {
      await this.generateTokenString(ShowcaseAuthorizationClient._userUrl);
    }
    if (this._accessToken) {
      return `Bearer ${this._accessToken.tokenString}`;
    }
    return "";
  };

  /**
   * required by BrowserAuthorizationClient
   */
  public signIn = async (): Promise<void> => {
    return this.generateTokenString(ShowcaseAuthorizationClient._userUrl);
  };

  /**
   * required by BrowserAuthorizationClient
   */
  public signOut = async (): Promise<void> => {
    return Promise.resolve();
  };

  /**
   * required by BrowserAuthorizationClient
   */
  public readonly onAccessTokenChanged = new BeEvent<(token: AccessToken | undefined) => void>();
}
