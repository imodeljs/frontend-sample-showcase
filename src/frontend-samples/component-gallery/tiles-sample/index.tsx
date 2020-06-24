/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "@bentley/icons-generic-webfont/dist/bentley-icons-generic-webfont.css";
import "../../../common/samples-common.scss";
import "../CommonComponentTools/index.scss";
import { ComponentContainer, ComponentExampleProps } from "../CommonComponentTools/ComponentContainer";
import { FeaturedTile, MinimalFeaturedTile, MinimalTile, Tile } from "@bentley/ui-core";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
  return { title, description, content };
};

export class TilesList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getTilesData(): ComponentExampleProps[] {
    return [
      createComponentExample("Normal Tile", undefined,
        <Tile title="Normal Tile" icon="icon-placeholder">
          <a>Link 1</a> {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
          <a>Link 2</a> {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        </Tile>),
      createComponentExample("Featured Tile", undefined,
        <FeaturedTile title="Featured Tile" icon="icon-placeholder">
          <a>Link 1</a> {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
          <a>Link 2</a> {/* eslint-disable-line jsx-a11y/anchor-is-valid */}
        </FeaturedTile>),
      createComponentExample("Minimal Tile", undefined, <MinimalTile title="Minimal Tile" icon="icon-placeholder" />),
      createComponentExample("Featured Minimal Tile", undefined, <MinimalFeaturedTile title="Minimal Featured Tile" icon="icon-placeholder" />),
      createComponentExample("Tile stepNum={0}", undefined, <MinimalFeaturedTile stepNum={0} title="Tile stepNum={0}" icon="icon-placeholder" />),
      createComponentExample("Tile stepNum={6}", undefined, <MinimalFeaturedTile stepNum={6} title="Tile stepNum={6}" icon="icon-placeholder" />),
      createComponentExample("Tile stepNum={9}", undefined, <MinimalFeaturedTile stepNum={9} title="Tile stepNum={9}" icon="icon-placeholder" />),
      createComponentExample("Tile stepNum={15}", undefined, <MinimalFeaturedTile stepNum={15} title="Tile stepNum={15}" icon="icon-placeholder" />),
    ];
  }

  public static async setup() {
    return <TilesList></TilesList>;
  }

  // Creates the side panel featuring a description of the component type, as well as providing a github link to the sample code
  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Different styles of tiles that can be used in iModel.js applications</span>
          </div>
        </div>
      </>
    );
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        {this.getControlPane()}
        <ComponentContainer data={TilesList.getTilesData()}></ComponentContainer>
      </>
    );
  }

}
