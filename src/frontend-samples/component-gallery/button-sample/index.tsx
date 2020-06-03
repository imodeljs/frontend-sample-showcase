/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleSpec } from "../../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../../Components/GithubLink";
import "../../../common/samples-common.scss";

import "../CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "../CommonComponentTools/ComponentContainer";

import { Button, ButtonSize, ButtonType, UnderlinedButton } from "@bentley/ui-core";

export function getButtonSpec(): SampleSpec {
    return ({
        name: "button-sample",
        label: "UI-Buttons",
        image: "ui-button-thumbnail.png",
        customModelList: [],

        setup: ButtonList.setup,
    });
}

export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
    return { title, description, content };
};

export class ButtonList extends React.Component<{}> {

    public static getButtonData(): ComponentExampleProps[] {
        return [
            createComponentExample("Basic Button", "Primary Button", <Button>Primary Button</Button>),
            createComponentExample("Disabled Button", "Button with disabled prop", <Button disabled>Disabled Button</Button>),
            createComponentExample("Blue Button", "Button with ButtonType.Blue", <Button buttonType={ButtonType.Blue}>Blue Button</Button>),
            createComponentExample("Hollow Button", "Button with ButtonType.Hollow", <Button buttonType={ButtonType.Hollow}>Hollow Button</Button>),
            createComponentExample("Large Basic Button", "Primary Button with size={ButtonSize.Large}", <Button size={ButtonSize.Large}>Primary Button</Button>),
            createComponentExample("Large Disabled Button", "Button with disabled and size={ButtonSize.Large} props", <Button disabled size={ButtonSize.Large}>Disabled Button</Button>),
            createComponentExample("Large Blue Button", "Button with ButtonType.Blue and size={ButtonSize.Large}", <Button buttonType={ButtonType.Blue} size={ButtonSize.Large}>Blue Button</Button>),
            createComponentExample("Large Hollow Button", "Button with ButtonType.Hollow and size={ButtonSize.Large}", <Button buttonType={ButtonType.Hollow} size={ButtonSize.Large}>Hollow Button</Button>),
            createComponentExample("Underlined Button", "UnderlinedButton component", <UnderlinedButton>Underlined Button</UnderlinedButton>),
        ];
    }

    public static async setup() {
        return <ButtonList></ButtonList>;
    }

    public getControlPlane() {
        return (
            <>
        <div className="sample-ui  component-ui">
                    <div className="sample-instructions">
                        <span>Different styles of buttons that can be used in iModel.js applications</span>
                        <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
                    </div>
                </div>
            </>
        )
    }

    public render() {
        return (
            <>
            {this.getControlPlane()}
             <ComponentContainer data = {ButtonList.getButtonData()}></ComponentContainer>
            </>
        );
    }
}
