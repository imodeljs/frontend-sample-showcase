/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";

import {
  ControlledTree, DelayLoadedTreeNodeItem, ITreeDataProvider, PropertyValueRendererManager, SelectionMode, TreeActions,
  TreeDataChangesListener, TreeModelNode, TreeNodeItem, TreeNodeRendererProps, TreeRenderer, TreeRendererProps,
  useTreeEventsHandler, useTreeModelSource, useTreeNodeLoader, useVisibleTreeNodes,
} from "@bentley/ui-components";
import { ExpansionToggle } from "@bentley/ui-core";
import { PropertyRecord } from "@bentley/ui-abstract";
import { BeEvent } from "@bentley/bentleyjs-core";
import "./TableNodeTree.scss";

/**
 * This component demonstrates use `ControlledTree` with custom nodes rendering. It uses
 * `DataProvider` class to get some fake data to show. Tree by this component is rendered
 * like multi column tree with header at the top and each node divided into three columns.
 *
 * In order to override default rendering in `ControlledTree` custom 'treeRenderer' should
 * be passed to it. In this component 'nodeTableTreeRenderer' is used. It uses default
 * `TreeRenderer` with overridden node renderer.
 */
export function TableNodeTree() {
  // create data provider to get some nodes to show in tree
  // `React.useMemo' is used avoid creating new object on each render cycle
  const dataProvider = React.useMemo(() => new DataProvider(), []);

  // create model source for tree model. Model source contains tree model and provides an API to modify
  // model and listen for changes in tree model.
  // `useTreeModelSource` creates new model source when 'dataProvider' object changes
  const modelSource = useTreeModelSource(dataProvider);

  // create tree node loader to load nodes to tree model. It uses 'dataProvider' to get
  // nodes and adds them to tree model using 'modelSource'
  const nodeLoader = useTreeNodeLoader(dataProvider, modelSource);

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
    <div className="custom-tree">
      <div className="tree-header">
        <span className="col-1">Label</span>
        <span className="col-2">Color</span>
        <span className="col-3">Size</span>
      </div>
      <div className="tree-wrapper">
        <ControlledTree
          nodeLoader={nodeLoader}
          selectionMode={SelectionMode.None}
          treeEvents={eventHandler}
          visibleNodes={visibleNodes}
          // pass custom tree renderer that will render each node in three columns
          treeRenderer={nodeTableTreeRenderer}
        />
      </div>
    </div>
  </>;
}

/** Custom tree renderer that overrides default node renderer to render node as table row */
const nodeTableTreeRenderer = (props: TreeRendererProps) => (
  <TreeRenderer
    {...props}
    nodeRenderer={nodeTableRenderer}
  />
);

/** Custom node renderer that renders node in three columns */
const nodeTableRenderer = (props: TreeNodeRendererProps) => {
  return <NodeTable
    treeActions={props.treeActions}
    node={props.node}
  />;
};

/** Functional component that renders node in three columns */
function NodeTable(props: { treeActions: TreeActions, node: TreeModelNode }) {
  const onExpansionToggle = React.useCallback(() => {
    if (props.node.isExpanded)
      props.treeActions.onNodeCollapsed(props.node.id);
    else
      props.treeActions.onNodeExpanded(props.node.id);
  }, [props.node, props.treeActions]);

  const expansionToggle = React.useMemo(() => {
    return <ExpansionToggle
      className="expansion-toggle"
      onClick={onExpansionToggle}
      isExpanded={props.node.isExpanded}
    />;
  }, [onExpansionToggle, props.node]);

  const offset = props.node.depth * 20 + (props.node.numChildren === 0 ? 25 : 0);

  return (
    <div className="table-node">
      <div className="col-1" >
        <div className="node-offset" style={{ marginLeft: offset }}>
          {props.node.numChildren !== 0 && expansionToggle}
          {PropertyValueRendererManager.defaultManager.render(props.node.label)}
        </div>
      </div>
      <div className="col-2">{props.node.item?.extendedData?.color}</div>
      <div className="col-3">{props.node.item?.extendedData?.size}</div>
    </div>
  );
}

/** Data provider that is used to get some fake nodes */
class DataProvider implements ITreeDataProvider {
  public onTreeNodeChanged = new BeEvent<TreeDataChangesListener>();
  public async getNodesCount(parent?: TreeNodeItem) {
    if (parent === undefined)
      return 3;

    switch (parent.id) {
      case "TestNode-1": return 3;
      case "TestNode-2": return 3;
      case "TestNode-3": return 2;
      case "TestNode-3-1": return 2;
      default: return 0;
    }
  }
  public async getNodes(parent?: TreeNodeItem) {
    if (parent === undefined)
      return sampleTreeItems.slice(0, 3);

    switch (parent.id) {
      case "TestNode-1": return sampleTreeItems.slice(3, 6);
      case "TestNode-2": return sampleTreeItems.slice(6, 9);
      case "TestNode-3": return sampleTreeItems.slice(9, 11);
      case "TestNode-3-1": return sampleTreeItems.slice(11);
      default: return [];
    }
  }
}

const sampleTreeItems: DelayLoadedTreeNodeItem[] = [
  { id: "TestNode-1", label: PropertyRecord.fromString("TestNode 1"), extendedData: { color: "Red", size: "Small" }, hasChildren: true },
  { id: "TestNode-2", label: PropertyRecord.fromString("TestNode 2"), extendedData: { color: "Blue", size: "Medium" }, hasChildren: true },
  { id: "TestNode-3", label: PropertyRecord.fromString("TestNode 3"), extendedData: { color: "Green", size: "Big" }, hasChildren: true },
  { id: "TestNode-1-1", label: PropertyRecord.fromString("TestNode 1-1"), extendedData: { color: "Red", size: "Small" } },
  { id: "TestNode-1-2", label: PropertyRecord.fromString("TestNode 1-2"), extendedData: { color: "Red", size: "Small" } },
  { id: "TestNode-1-3", label: PropertyRecord.fromString("TestNode 1-3"), extendedData: { color: "Red", size: "Small" } },
  { id: "TestNode-2-1", label: PropertyRecord.fromString("TestNode 2-1"), extendedData: { color: "Blue", size: "Medium" } },
  { id: "TestNode-2-2", label: PropertyRecord.fromString("TestNode 2-2"), extendedData: { color: "Blue", size: "Medium" } },
  { id: "TestNode-2-3", label: PropertyRecord.fromString("TestNode 2-3"), extendedData: { color: "Blue", size: "Medium" } },
  { id: "TestNode-3-1", label: PropertyRecord.fromString("TestNode 3-1"), extendedData: { color: "Green", size: "Big" }, hasChildren: true },
  { id: "TestNode-3-2", label: PropertyRecord.fromString("TestNode 3-2"), extendedData: { color: "Green", size: "Big" } },
  { id: "TestNode-3-1-1", label: PropertyRecord.fromString("TestNode 3-1-2"), extendedData: { color: "Green", size: "Big" } },
  { id: "TestNode-3-1-2", label: PropertyRecord.fromString("TestNode 3-1-2"), extendedData: { color: "Green", size: "Big" } },
];
