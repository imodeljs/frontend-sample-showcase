/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./index.scss";
export declare class ComponentContainer extends React.Component<{
    data: ComponentExampleProps[];
}> {
    render(): JSX.Element;
}
export interface ComponentExampleProps {
    title: string;
    description?: string;
    content: React.ReactNode;
}
export declare const ComponentExample: React.FC<ComponentExampleProps>;
