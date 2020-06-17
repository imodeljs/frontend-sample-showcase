/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { useVisibleTreeNodes, ControlledTree, SelectionMode, AbstractTreeNodeLoaderWithProvider, TreeNodeItem } from "@bentley/ui-components";
import { usePresentationTreeNodeLoader, UnifiedSelectionTreeEventHandler, IPresentationTreeDataProvider } from "@bentley/presentation-components";
import { Ruleset, KeySet, Keys, InstanceKey, Key, NodeKey } from "@bentley/presentation-common";
import { SelectionChangeType } from "@bentley/presentation-frontend";
import { useDisposable } from "@bentley/ui-core";

import { GithubLink } from "../../../Components/GithubLink";
import { StartupComponent } from "../../../Components/Startup/Startup";

const PAGING_SIZE = 20;
const RULESET_CLASSES: Ruleset = require("./Classes.json"); // tslint:disable-line: no-var-requires

export interface CustomUnifiedSelectionTreeProps {
  imodel: IModelConnection;
}

export class CustomUnifiedSelectionTreeSample extends React.Component<{ iModelName: string }, { iModel: IModelConnection }> {

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
    return <CustomUnifiedSelectionTreeSample iModelName={iModelName}></CustomUnifiedSelectionTreeSample>;
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
            <CustomUnifiedSelectionTree imodel={this.state.iModel}></CustomUnifiedSelectionTree>
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
 * This component demonstrates how to hook `ControlledTree` into Unified Selection with custom Unified Selection handling.
 * It uses presentation rules defined in './Classes.json' to load data from supplied iModel.
 *
 * In order for tree to add/remove to/from Unified Selection and react to it's changes `CustomUnifiedSelectionHandler`
 * is used. This handler extends default `UnifiedSelectionTreeEventHandler` and modifies how keys are
 * added/removed to/from Unified Selection and how nodes selection status is determined when Unified Selection changes.
 * It adds/removes only ECClass keys to/from Unified selection. If selected/deselected node represents ECProperty then
 * ECClass key of that ECProperty is added/removed.
 *
 * To determine which nodes should be selected handler looks for ECClass keys in Unified Selection.
 * Node will be selected in tree if:
 * - Node represents ECClass and it's key is in Unified Selection
 * - Node represents ECProperty and ECProperty's class key is in Unified Selection
 */
export function CustomUnifiedSelectionTree(props: CustomUnifiedSelectionTreeProps) {
  // create tree node loader to load nodes using presentation rules. It loads nodes to tree model
  // in pages using supplied iModel and presentation ruleset.
  // 'usePresentationTreeNodeLoader' creates `TreeModelSource` and `PagedTreeNodeLoader`.
  // Model source can be accessed through node loader. New model source and node loader
  // are created when any property of object passed to `usePresentationTreeNodeLoader` changes
  const nodeLoader = usePresentationTreeNodeLoader({
    imodel: props.imodel,
    ruleset: RULESET_CLASSES,
    pageSize: PAGING_SIZE,
  });

  // create event handler that handles tree events: expanding/collapsing, selecting/deselecting nodes. Additionally it adds/removes keys to/from
  // Unified Selection when nodes are selected/deselected and updates nodes' states in tree model according Unified Selection.
  // `useDisposable` takes care of disposing old `CustomUnifiedSelectionHandler` when new is created.
  // `React.useCallback` is used to avoid creating new callback on every render
  const eventHandler = useDisposable(React.useCallback(() => new CustomUnifiedSelectionHandler(nodeLoader), [nodeLoader]));

  // get list of visible nodes to render in `ControlledTree`. This is a flat list of nodes in tree model.
  // `useVisibleTreeNodes` uses 'modelSource' to get flat list of nodes and listens for model changes to
  // re-render component with updated nodes list
  const visibleNodes = useVisibleTreeNodes(nodeLoader.modelSource);

  return <>
    <div className="instructions">
      This tree shows ECClasses and their ECProperties. Selecting an ECClass or its ECProperty puts the class to unified selection storage.
      Also, whenever an ECClass is added to unified selection storage, the tree shows it and its properties as selected.
    </div>
    <div className="tree">
      <ControlledTree
        nodeLoader={nodeLoader}
        selectionMode={SelectionMode.Extended}
        treeEvents={eventHandler}
        visibleNodes={visibleNodes}
      />
    </div>
  </>;
}

/**
 * Custom Unified Selection handler that extends default `UnifiedSelectionTreeEventHandler` by overriding
 * how it determines if node should be selected and what it adds/removes from Unified Selection.
 */
class CustomUnifiedSelectionHandler extends UnifiedSelectionTreeEventHandler {
  constructor(nodeLoader: AbstractTreeNodeLoaderWithProvider<IPresentationTreeDataProvider>) {
    super({ nodeLoader, collapsedChildrenDisposalEnabled: true });
  }

  /**
   * Determines if node should be selected.
   *
   * Default implementation returns true if node key is in selection
   * or node is ECInstance node and instance key is in selection.
   *
   * New implementation works differently on different kind of nodes:
   * - If node represents ECProperty then looks for ECClass of that ECProperty in selection.
   * - If node represents ECClass then looks for it in selection.
   */
  protected shouldSelectNode(node: TreeNodeItem, selection: Readonly<KeySet>): boolean {
    // if node represents property look for it's class in selection
    if (node.extendedData?.isProperty) {
      if (!node.extendedData?.classId && !node.extendedData?.className && !node.extendedData?.schemaName)
        return false;

      // create a key of property's ECClass
      const instanceKey: InstanceKey = {
        className: `${node.extendedData.schemaName}:${node.extendedData.className}`,
        id: node.extendedData.classId,
      };
      // check if selection contains ECClass key
      return selection.has(instanceKey);
    }

    // if node represents class look for it in selection
    if (node.extendedData?.isClass) {
      const nodeKey = this.getNodeKey(node);
      // check if selection contains ECClass key
      return NodeKey.isInstancesNodeKey(nodeKey) ? selection.hasAny(nodeKey.instanceKeys) : false;
    }
    return false;
  }

  /**
   * Returns node keys that should be added, removed or used to replace unified selection.
   *
   * Default implementation returns keys of supplied nodes.
   *
   * New implementation works differently on different kind of nodes:
   * - If node represents ECProperty then returns key of it's ECClass.
   * - If node represents ECClass then returns it's key.
   */
  protected createKeysForSelection(nodes: TreeNodeItem[], _selectionType: SelectionChangeType): Keys {
    return nodes.reduce((keys: Key[], node) => {
      // if node represents class put its instance key to the selection
      if (node.extendedData && node.extendedData.isClass) {
        const nodeKey = this.getNodeKey(node);
        return NodeKey.isInstancesNodeKey(nodeKey) ? [...keys, ...nodeKey.instanceKeys] : keys;
      }

      // if node represents property put class instance key to the selection
      if (node.extendedData && node.extendedData.isProperty) {
        return [...keys, {
          className: `${node.extendedData.schemaName}:${node.extendedData.className}`,
          id: node.extendedData.classId,
        }];
      }

      return keys;
    }, []);
  }
}

