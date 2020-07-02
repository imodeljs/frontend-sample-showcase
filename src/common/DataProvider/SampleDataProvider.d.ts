/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* Licensed under the MIT License. See LICENSE.md in the project root for license terms.
*--------------------------------------------------------------------------------------------*/
import { DelayLoadedTreeNodeItem, ITreeDataProvider, TreeDataChangesListener, TreeNodeItem } from "@bentley/ui-components";
import { BeEvent } from "@bentley/bentleyjs-core";
/**
 * Data provider that returns some fake nodes to show in tree.
 */
export declare class SampleDataProvider implements ITreeDataProvider {
    onTreeNodeChanged: BeEvent<TreeDataChangesListener>;
    getNodesCount(parent?: TreeNodeItem): Promise<1 | 0 | 2 | 5 | 3>;
    getNodes(parent?: TreeNodeItem): Promise<DelayLoadedTreeNodeItem[]>;
}
