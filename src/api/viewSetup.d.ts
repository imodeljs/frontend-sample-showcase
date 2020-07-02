/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
export declare class ViewSetup {
    /** Pick the first available spatial view definition in the imodel */
    private static getFirstViewDefinitionId;
    static getAspectRatio(): number | undefined;
    static getDefaultView: (imodel: IModelConnection) => Promise<ViewState>;
}
