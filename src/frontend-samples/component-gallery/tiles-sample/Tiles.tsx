/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/samples-common.scss";
import "common/UIComponents/index.scss";
import { UIComponentContainer, UIComponentExampleProps } from "common/UIComponents/UIComponentContainer";
import { ControlPane } from "common/ControlPane/ControlPane";
import { Badge, MenuItem, Tag, TagContainer, Tile, UserIcon } from "@itwin/itwinui-react";
import { SvgFolder, SvgImodelHollow, SvgTag } from "@itwin/itwinui-icons-react";

// Creates an instance of ComponentExampleProps that can be used in the ComponentContainer
export const createComponentExample = (title: string, description: string | undefined, content: React.ReactNode): UIComponentExampleProps => {
  return { title, description, content };
};

export default class TilesList extends React.Component<{}> {

  // Combines several instances of ComponentExampleProps to be passed into the ComponentContainer
  public static getTilesData(): UIComponentExampleProps[] {
    return [
      createComponentExample("Basic Tile", undefined,
        <Tile
          badge={<Badge backgroundColor="hsl(197, 71%, 83%)">Badge</Badge>}
          description="National stadium in Singapore. Features landscape details and a metro station. This is the largest sample iModel."
          metadata={<><SvgTag /><TagContainer><Tag variant="basic">tag 1</Tag><Tag variant="basic">tag 2</Tag></TagContainer></>}
          moreOptions={[
            <MenuItem key="1" onClick={function noRefCheck() { }}>Item 1</MenuItem>,
            <MenuItem key="2" onClick={function noRefCheck() { }}>Item 2</MenuItem>,
          ]}
          name="Stadium"
          thumbnail="https://itwinplatformcdn.azureedge.net/iTwinUI/stadium.png"
          variant="default"
        />),
      createComponentExample("Condensed Tile", undefined,

        <Tile
          moreOptions={[
            <MenuItem key="1" onClick={function noRefCheck() { }}>Item 1</MenuItem>,
            <MenuItem key="2" onClick={function noRefCheck() { }}>Item 2</MenuItem>,
          ]}
          name="Condensed"
          thumbnail={<SvgImodelHollow />}
          variant="default"
        />),
      createComponentExample("Folder Tile", undefined,
        <Tile
          description="Folder description"
          metadata={<span>Folder metadata</span>}
          moreOptions={[
            <MenuItem key="1" onClick={function noRefCheck() { }}>Item 1</MenuItem>,
            <MenuItem key="2" onClick={function noRefCheck() { }}>Item 2</MenuItem>,
          ]}
          name="Folder name"
          thumbnail={<SvgFolder />}
          variant="folder"
        />),
      createComponentExample("User Icon Tile", undefined,
        <Tile
          badge={<Badge backgroundColor="hsl(197, 71%, 83%)">Badge</Badge>}
          description="User description"
          moreOptions={[
            <MenuItem key="1" onClick={function noRefCheck() { }}>Item 1</MenuItem>,
            <MenuItem key="2" onClick={function noRefCheck() { }}>Item 2</MenuItem>,
          ]}
          name="Some User"
          thumbnail={<UserIcon abbreviation="TR" backgroundColor="#6AB9EC" image={<img src="https://itwinplatformcdn.azureedge.net/iTwinUI/user-placeholder.png" />} size="large" status="online" title="Terry Rivers" />}
          variant="default"
        />),
    ];
  }

  // Combines the control pane and the component container to create the final display
  // For more implementation details about the layout of the component container, code and documentation is available in ../CommonComponentTools/ComponentContainer.tsx
  public render() {
    return (
      <>
        <ControlPane instructions="Different styles of tiles that can be used in iModel.js applications."></ControlPane>
        <UIComponentContainer data={TilesList.getTilesData()}></UIComponentContainer>
      </>
    );
  }
}
