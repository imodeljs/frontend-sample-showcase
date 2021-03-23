/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import "./index.scss";

// These react components are used to organize each of the component examples, as well as their names and descriptions

// The component container takes in several sets of example properties(component title, description, and actual component), and displays all of them as a list
export class UIComponentContainer extends React.Component<{ data: UIComponentExampleProps[] }> {
  public render() {
    return (
      <div id="component-container" className="component-container">
        {this.props.data.map((exampleProps: UIComponentExampleProps, index: number) => {
          return (
            <UIComponentExample key={index.toString()} title={exampleProps.title} description={exampleProps.description} content={exampleProps.content} />
          );
        })}
      </div>
    );
  }
}

// These are the possible attributes of each of the components being displayed
export interface UIComponentExampleProps {
  title: string;
  description?: string;
  content: React.ReactNode;
}

// This formats a single component, along with its corresponding title and description, and adds them to the DOM
// tslint:disable-next-line: variable-name
export const UIComponentExample: React.FC<UIComponentExampleProps> = (props: UIComponentExampleProps) => {
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
