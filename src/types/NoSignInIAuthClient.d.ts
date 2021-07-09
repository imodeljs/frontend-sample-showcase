/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { BeEvent, ClientRequestContext } from "@bentley/bentleyjs-core";
import { AccessToken } from "@bentley/itwin-client";
import { FrontendAuthorizationClient } from "@bentley/frontend-authorization-client";
export declare class NoSignInIAuthClient implements FrontendAuthorizationClient {
    readonly onUserStateChanged: BeEvent<(token: AccessToken | undefined) => void>;
    protected _accessToken?: AccessToken;
    protected _devAccessToken?: AccessToken;
    constructor();
    signIn(requestContext?: ClientRequestContext): Promise<void>;
    signOut(requestContext?: ClientRequestContext): Promise<void>;
    get isAuthorized(): boolean;
    get hasExpired(): boolean;
    get hasSignedIn(): boolean;
    generateTokenString(userURL: string, requestContext?: ClientRequestContext): Promise<void>;
    getAccessToken(): Promise<AccessToken>;
    getDevAccessToken(): Promise<AccessToken>;
}
