/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import { DelayLoadedTreeNodeItem, ITreeDataProvider, TreeDataChangesListener, TreeNodeItem } from "@itwin/components-react";
import { PropertyRecord } from "@itwin/appui-abstract";
import { BeEvent } from "@itwin/core-bentley";

/**
 * Data provider that returns some fake nodes to show in tree.
 */
export class SampleDataProvider implements ITreeDataProvider {
  public onTreeNodeChanged = new BeEvent<TreeDataChangesListener>();

  public async getNodesCount(parent?: TreeNodeItem) {
    if (parent === undefined)
      return 5;

    switch (parent.id) {
      case "TestNode-1": return 3;
      case "TestNode-2": return 3;
      case "TestNode-2-2": return 2;
      case "TestNode-2-3": return 2;
      case "TestNode-3": return 3;
      case "TestNode-5": return 1;
      default: return 0;
    }
  }

  public async getNodes(parent?: TreeNodeItem) {
    if (parent === undefined) {
      return [
        createNode("TestNode-1", "TestNode 1", true), createNode("TestNode-2", "TestNode 2", true), createNode("TestNode-3", "TestNode 3", true),
        createNode("TestNode-4", "TestNode 4"), createNode("TestNode-5", "TestNode 5", true),
      ];
    }

    switch (parent.id) {
      case "TestNode-1": return [createNode("TestNode-1-1", "TestNode 1-1"), createNode("TestNode-1-2", "TestNode 1-2"), createNode("TestNode-1-3", "TestNode 1-3")];
      case "TestNode-2": return [createNode("TestNode-2-1", "TestNode 2-1"), createNode("TestNode-2-2", "TestNode 2-2", true), createNode("TestNode-2-3", "TestNode 2-3", true)];
      case "TestNode-2-2": return [createNode("TestNode-2-2-1", "TestNode 2-2-1"), createNode("TestNode-2-2-2", "TestNode 2-2-2")];
      case "TestNode-2-3": return [createNode("TestNode-2-3-1", "TestNode 2-3-1"), createNode("TestNode-2-3-2", "TestNode 2-3-2")];
      case "TestNode-3": return [createNode("TestNode-3-1", "TestNode 3-1"), createNode("TestNode-3-2", "TestNode 3-2"), createNode("TestNode-3-3", "TestNode 3-3")];
      case "TestNode-5": return [createNode("TestNode-5-1", "TestNode 5-1")];
      default: return [];
    }
  }
}

const createNode = (id: string, label: string, hasChildren?: boolean): DelayLoadedTreeNodeItem => {
  return {
    id,
    label: PropertyRecord.fromString(label),
    hasChildren,
  };
};
