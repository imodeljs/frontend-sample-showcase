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
import {ComponentContainer, ComponentExampleProps} from "../CommonComponentTools/ComponentContainer";

import { SampleIModels } from "../../../Components/IModelSelector/IModelSelector";
import { Tile, MinimalTile, FeaturedTile, MinimalFeaturedTile} from "@bentley/ui-core"



export function getTilesSpec(): SampleSpec {
  return ({
    name: "tiles-sample",
    label: "UI-Tiles",
    image: "viewport-only-thumbnail.png",
    customModelList: [],

    setup: TilesList.setup ,
  });
}


export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): ComponentExampleProps => {
    return { title, description, content };
};



export class TilesList extends React.Component<{}> {

    public static getTilesData(): ComponentExampleProps[] {
        return  [
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
          ]
    }

    public static async setup() {
        return <TilesList></TilesList>
    }

    public getControlPlane() {
      return (
          <>
              <div className="sample-ui  component-ui">
                  <div className="sample-instructions">
                      <span>Different styles of tiles that can be used in iModel.js applications</span>
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
           <ComponentContainer data = {TilesList.getTilesData()}></ComponentContainer>
          </>
        );
    }
  
}