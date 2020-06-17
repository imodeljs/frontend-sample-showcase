/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import {
  useVisibleTreeNodes, ControlledTree, SelectionMode, useTreeEventsHandler, PagedTreeNodeLoader, TreeNodeItem, TreeModelSource,
  LoadedNodeHierarchy, TreeModelNode, TreeModelRootNode, isTreeModelNode, PageOptions, DelayLoadedTreeNodeItem, TreeDataProvider,
} from "@bentley/ui-components";
import { PresentationTreeDataProvider, IPresentationTreeDataProvider } from "@bentley/presentation-components";
import { Ruleset } from "@bentley/presentation-common";
import { useDisposable } from "@bentley/ui-core";
import { PropertyRecord } from "@bentley/ui-abstract";
import { isIDisposable } from "@bentley/bentleyjs-core";
import { SampleDataProvider } from "../Common";
import { GithubLink } from "../../../Components/GithubLink";
import { StartupComponent } from "../../../Components/Startup/Startup";

const PAGING_SIZE = 20;
const RULESET_TREE_HIERARCHY: Ruleset = require("../TreeHierarchy.json"); // tslint:disable-line: no-var-requires

export interface CustomNodeLoadingTreeProps {
  imodel: IModelConnection;
}

export class CustomNodeLoadingTreeSample extends React.Component<{ iModelName: string }, { iModel: IModelConnection }> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>In this example tree is rendered as a multi-column tree.</span>
            <GithubLink linkTarget="https://github.com/imodeljs/imodeljs-samples/tree/master/frontend-samples/tree-samples/custom-table-node-tree" />
          </div>
        </div>
      </>
    );
  }

  public static async setup(iModelName: string) {
    return <CustomNodeLoadingTreeSample iModelName={iModelName}></CustomNodeLoadingTreeSample>;
  }

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  }

  public render() {
    if (this.state && this.state.iModel) {
      return (
        <>
          {this.getControlPane()}
          <div className="sample-tree">
            <CustomNodeLoadingTree imodel={this.state.iModel}></CustomNodeLoadingTree>
          </div>
        </>
      );
    }
    return (
      <>
        {this.getControlPane()}
        <div className="sample-tree">
          <StartupComponent iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></StartupComponent>
        </div>
      </>
    );
  }

}

/**
 * This component demonstrates how to use `ControlledTree` with custom nodes loading to load nodes from
 * multiple data providers. Default node loaders `TreeNodeLoader` and `PagedTreeNodeLoader` works with
 * only one data provider. This component uses two data providers to load nodes: presentation data provider
 * which loads nodes from iModel using rules defined in '../TreeHierarchy.json' and `InMemoryDataProvider`
 * that loads some fake data.
 *
 * 'CustomNodeLoader' is used to load nodes from different data providers. It adds two root nodes:
 * "Presentation Hierarchy" and "In Memory Hierarchy". Children for "Presentation Hierarchy" node are
 * loaded from iModel using presentation rules. "In Memory Hierarchy" node's children are loaded using
 * fake data from `InMemoryDataProvider`
 *
 * Tree hierarchy loaded by `CustomNodeLoader looks like this:
 * - 'Presentation Hierarchy' [from rootProvider in `CustomNodeLoader`]
 *   - Root node 1      [from presentationDataProvider]
 *     - Child node 1   [from presentationDataProvider]
 *     - Child node 2   [from presentationDataProvider]
 *   - Root node 2      [from presentationDataProvider]
 *     - Child node 1   [from presentationDataProvider]
 * - 'In Memory Hierarchy'    [from rootProvider in `CustomNodeLoader`]
 *   - Root node 1      [from inMemoryDataProvider]
 *     - Child node 1   [from inMemoryDataProvider]
 *     - Child node 2   [from inMemoryDataProvider]
 *   - Root node 1      [from inMemoryDataProvider]
 *     - Child node 1   [from inMemoryDataProvider]
 */
export function CustomNodeLoadingTree(props: CustomNodeLoadingTreeProps) {
  // create data provider to load nodes from iModel using presentation rules
  // `React.useMemo' is used avoid creating new object on each render cycle
  const presentationDataProvider = React.useMemo(() => new PresentationProvider(props.imodel), [props.imodel]);

  // create data provider to get some fake nodes
  // `React.useMemo' is used avoid creating new object on each render cycle
  const inMemoryDataProvider = React.useMemo(() => new InMemoryDataProvider(), []);

  // create custom node loader which will load nodes to tree model from 'presentationDataProvider' and 'inMemoryDataProvider'.
  // `useDisposable` takes care of disposing old node loader when new is created. When node loader is disposed it disposes 'presentationDataProvider'
  // `React.useCallback` is used to avoid creating new callback on each render
  const nodeLoader = useDisposable(React.useCallback(() => new CustomNodeLoader(presentationDataProvider, inMemoryDataProvider), [presentationDataProvider, inMemoryDataProvider]));

  // create parameters for default tree event handler. It needs 'nodeLoader' to load child nodes when parent node
  // is expanded and 'modelSource' to modify nodes' state in tree model. 'collapsedChildrenDisposalEnabled' flag
  // specifies that child nodes should be removed from tree model when parent node is collapsed.
  // `React.useMemo' is used to avoid creating new params object on each render
  const eventHandlerParams = React.useMemo(() => ({ nodeLoader, modelSource: nodeLoader.modelSource, collapsedChildrenDisposalEnabled: true }), [nodeLoader]);

  // create default event handler. It handles tree events: expanding/collapsing, selecting/deselecting nodes,
  // checking/unchecking checkboxes. It also initiates child nodes loading when parent node is expanded.
  // `useTreeEventsHandler` created new event handler when 'eventHandlerParams' object changes
  const eventHandler = useTreeEventsHandler(eventHandlerParams);

  // get list of visible nodes to render in `ControlledTree`. This is a flat list of nodes in tree model.
  // `useVisibleTreeNodes` uses 'modelSource' to get flat list of nodes and listens for model changes to
  // re-render component with updated nodes list
  const visibleNodes = useVisibleTreeNodes(nodeLoader.modelSource);

  return <>
    <div className="instructions">
      Data in this tree is loaded using two data providers: 'Presentation Hierarchy' nodes are loaded using Presentation rules
      and 'In Memory Hierarchy' nodes are loaded from memory.
    </div>
    <div className="tree">
      <ControlledTree
        nodeLoader={nodeLoader}
        selectionMode={SelectionMode.None}
        treeEvents={eventHandler}
        visibleNodes={visibleNodes}
      />
    </div>
  </>;
}

/**
 * Custom node loader that uses two different node loaders to load nodes. Itself it loads two root nodes and
 * for each of those nodes it uses different node loader to load children.
 */
class CustomNodeLoader extends PagedTreeNodeLoader<TreeDataProvider> {
  // root node for hierarchy loaded by presentation data provider
  private static _presentationRootNode: DelayLoadedTreeNodeItem = {
    id: "PresentationHierarchyRoot",
    label: PropertyRecord.fromString("Presentation Hierarchy"),
    autoExpand: false,
    extendedData: { presentationRoot: true },
    style: { isBold: true },
    hasChildren: true,
  };
  // root node for hierarchy loaded by in memory data provider
  private static _inMemoryRootNode: DelayLoadedTreeNodeItem = {
    id: "InMemoryHierarchyRoot",
    label: PropertyRecord.fromString("In Memory Hierarchy"),
    autoExpand: false,
    extendedData: { inMemoryRoot: true },
    style: { isBold: true },
    hasChildren: true,
  };
  // data provider that is used by this node loader to load two custom root nodes
  private static _rootProvider: DelayLoadedTreeNodeItem[] = [CustomNodeLoader._presentationRootNode, CustomNodeLoader._inMemoryRootNode];

  private _presentationNodeLoader: InnerNodeLoader;
  private _inMemoryNodeLoader: InnerNodeLoader;

  constructor(presentationProvider: IPresentationTreeDataProvider, inMemoryProvider: TreeDataProvider) {
    super(CustomNodeLoader._rootProvider, new TreeModelSource(), PAGING_SIZE);

    // create node loader which will load tree hierarchy under "In Memory Hierarchy" node
    this._inMemoryNodeLoader = new InnerNodeLoader(inMemoryProvider, this.modelSource, CustomNodeLoader._inMemoryRootNode.id);

    // create node loader which will load tree hierarchy under "Presentation Hierarchy" node
    this._presentationNodeLoader = new InnerNodeLoader(presentationProvider, this.modelSource, CustomNodeLoader._presentationRootNode.id);
  }

  /** Disposes node loader and used inner node loaders */
  public dispose() {
    super.dispose();
    this._inMemoryNodeLoader.dispose();
    this._presentationNodeLoader.dispose();
  }

  /** loads node to tree model for specified parent */
  public loadNode(parent: TreeModelNode | TreeModelRootNode, childIndex: number) {
    // if parent node is "Presentation Hierarchy" or any of it's children node
    // use '_presentationNodeLoader'
    if (isTreeModelNode(parent) && (parent.item.extendedData?.presentationRoot || parent.item.extendedData?.presentationNode)) {
      return this._presentationNodeLoader.loadNode(parent, childIndex);
    }

    // if parent node is "In Memory Hierarchy" or any of it's children node
    // use '_inMemoryNodeLoader'
    if (isTreeModelNode(parent) && (parent.item.extendedData?.inMemoryRoot || parent.item.extendedData?.inMemoryNode)) {
      return this._inMemoryNodeLoader.loadNode(parent, childIndex);
    }

    // use default nodes loading for other nodes
    return super.loadNode(parent, childIndex);
  }

}

/** Custom node loader that loads whole tree under specified node */
class InnerNodeLoader extends PagedTreeNodeLoader<TreeDataProvider> {
  // fake root node that will be used to get root nodes from data provider used in this node loader
  private _rootNode: TreeModelRootNode = { id: undefined, numChildren: undefined, depth: -1 };

  constructor(dataProvider: TreeDataProvider, modelSource: TreeModelSource, private _resultsRootId: string) {
    super(dataProvider, modelSource, PAGING_SIZE);
  }

  public dispose() {
    super.dispose();
    if (isIDisposable(this.dataProvider))
      this.dataProvider.dispose();
  }

  public updateModel(loadedHierarchy: LoadedNodeHierarchy) {
    // if root nodes was loaded from data provider change parent id to the node that should contain tree loaded by this node loader
    if (loadedHierarchy.parentId === undefined)
      loadedHierarchy.parentId = this._resultsRootId;

    // add nodes to the model
    super.updateModel(loadedHierarchy);
  }

  public loadNode(parentNode: TreeModelNode | TreeModelRootNode, childIndex: number) {
    // if parent node is the node that should contain hierarchy loaded by this node loader need to simulate root nodes loading.
    // Because root nodes from data provider used by this node loader are not yet loaded and should be put directly under this
    // parent node
    if (parentNode.id === this._resultsRootId) {
      return super.loadNode({ ...this._rootNode, numChildren: parentNode.numChildren }, childIndex);
    }

    // if parent node is any node loaded by this node loader use default node loading
    return super.loadNode(parentNode, childIndex);
  }
}

/**
 * Data provider that returns presentation nodes using Presentation rules.
 * It also marks all loaded nodes, so `CustomNodeLoader` can recognize if
 * node was loaded using this data provider or not.
 */
class PresentationProvider extends PresentationTreeDataProvider {
  constructor(imodel: IModelConnection) {
    super({ imodel, ruleset: RULESET_TREE_HIERARCHY, pagingSize: PAGING_SIZE });
  }

  public async getNodes(parentNode?: TreeNodeItem, pageOptions?: PageOptions): Promise<DelayLoadedTreeNodeItem[]> {
    // get nodes from `PresentationTreeDataProvider`
    const nodes = await super.getNodes(parentNode, pageOptions);

    // mark each node by defining 'presentationNode' property in node's 'extendedData'
    nodes.forEach((node) => {
      node.extendedData = { presentationNode: true };
    });
    return nodes;
  }
}

/**
 * Data provider that extends `SampleDataProvider` to additionally mark
 * all loaded nodes, so `CustomNodeLoader` can recognize if
 * node was loaded using this data provider or not.
 */
class InMemoryDataProvider extends SampleDataProvider {
  public async getNodes(parentNode?: TreeNodeItem) {
    // get node from 'SampleDataProvider'
    const nodes = await super.getNodes(parentNode);

    // mark each node by defining 'inMemoryNode' property in node's 'extendedData'
    nodes.forEach((node) => {
      node.extendedData = { inMemoryNode: true };
    });
    return nodes;
  }
}
