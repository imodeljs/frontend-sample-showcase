/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection, ViewState } from "@bentley/imodeljs-frontend";
export interface ReloadableViewportProps {
    iModelName: string;
    getCustomViewState?: (imodel: IModelConnection) => Promise<ViewState>;
    onIModelReady?: (imodel: IModelConnection) => void;
}
export interface ReloadableViewportState {
    /** iModel whose contents should be displayed in the viewport */
    imodel?: IModelConnection;
    /** View state to use when the viewport is first loaded */
    viewState?: ViewState;
}
/** Renders viewport, toolbar, and associated elements */
export declare class ReloadableViewport extends React.PureComponent<ReloadableViewportProps, ReloadableViewportState> {
    constructor(props?: any, context?: any);
    render(): JSX.Element;
    componentWillReceiveProps(nextProps: ReloadableViewportProps): void;
    private _onIModelReady;
}
