/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import { SampleSpec } from "../../Components/SampleShowcase/SampleShowcase";
import { GithubLink } from "../../Components/GithubLink";
import "../../common/samples-common.scss";
import { IModelConnection, Viewport } from "@bentley/imodeljs-frontend";
import { SampleIModels } from "../../Components/IModelSelector/IModelSelector";
import { Button, ButtonType, ButtonSize, UnderlinedButton } from "@bentley/ui-core"
import { ViewportOnlyUI } from "../viewport-only-sample";
import { setupMaster } from "cluster";
import "./index.scss";


// cSpell:ignore imodels

export function getButtonSpec(): SampleSpec {
  return ({
    name: "button-sample",
    label: "Button",
    image: "viewport-only-thumbnail.png",
    modelList: [SampleIModels.RetailBuilding, SampleIModels.BayTown, SampleIModels.House],
    setup: ButtonList.setup ,
  });
}



/** Creates a Component Example */
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
          ]
    }

    public static async setup() {
        return <ButtonList></ButtonList>
    }

    /** The sample's render method */
    public render() {
        const buttonData = ButtonList.getButtonData()
        return (
            <>
            { /* This is the ui specific for this sample.*/}
            <div className="sample-ui">
                <div>
                <span>Use the toolbar at the right to navigate the model.</span>
                <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/viewer-only-sample" />
                <div className = "sample-options">
                    {buttonData.map((exampleProps: ComponentExampleProps, index: number) => {
                        return (
                            <ComponentExample key={index.toString()} title={exampleProps.title} description={exampleProps.description} content={exampleProps.content} />
                        );
                        })}
                </div>
                </div>
            </div>
            </>
        );
    }
  
}

export interface ComponentExampleProps {
    title: string;
    description?: string;
    content: React.ReactNode;
  }
  
  /** Component Example component */
  // tslint:disable-next-line:variable-name
  export const ComponentExample: React.FC<ComponentExampleProps> = (props: ComponentExampleProps) => {
    const { title, description, content } = props;
    return (
      <div className="component-example-container">
        <div className="panel left-panel">
          <span className="title">{title}</span>
          <span className="description">{description}</span>
        </div>
        <div className="panel right-panel">
          {content}
        </div>
      </div>
    );
  };

