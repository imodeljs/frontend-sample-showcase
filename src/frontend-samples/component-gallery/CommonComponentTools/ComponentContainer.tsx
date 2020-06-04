/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "./index.scss";



export class ComponentContainer extends React.Component<{data: ComponentExampleProps[]}> {
    public render() {
        return (
            <div id = "component-container" className = "component-container">
                {this.props.data.map((exampleProps: ComponentExampleProps, index: number) => {
                    return (
                        <ComponentExample key={index.toString()} title={exampleProps.title} description={exampleProps.description} content={exampleProps.content} />
                    );
                    })}
            </div>
        );
    }
}

export interface ComponentExampleProps {
    title: string;
    description?: string;
    content: React.ReactNode;
  }
  
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

