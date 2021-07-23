/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { ControlledTree, SelectionMode, TreeNodeItem, TreeNodeRenderer, TreeNodeRendererProps, TreeRenderer, TreeRendererProps, useTreeEventsHandler, useTreeModelSource, useTreeNodeLoader, useVisibleTreeNodes } from "@bentley/ui-components";
import { SampleDataProvider } from "@itwinjs-sandbox";
import { ImageCheckBox, NodeCheckboxRenderProps } from "@bentley/ui-core";

/**
 * This component demonstrates how use `ControlledTree` with custom checkbox rendering.
 * It uses `NodesWithCheckboxProvider` to get fake data to show.
 *
 * In order to override default rendering in `ControlledTree` custom 'treeRenderer' should
 * be passed to it. In this component 'nodeWithEyeCheckboxTreeRenderer' is used. It uses default
 * `TreeRenderer` with overridden node renderer.
 */
export const CustomCheckboxesTreeComponent: FunctionComponent = () => {
  // create data provider to get some nodes to show in tree
  // `React.useMemo' is used avoid creating new object on each render cycle
  const dataProvider = React.useMemo(() => new NodesWithCheckboxProvider(), []);

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
  // `React.useMemo' is used to avoid creating new params object on each render cycle
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
    <div className="tree tree-with-eye-checkboxes">
      <ControlledTree
        nodeLoader={nodeLoader}
        selectionMode={SelectionMode.None}
        treeEvents={eventHandler}
        visibleNodes={visibleNodes}
        // custom tree renderer to override default rendering. It is default 'TreeRenderer' with overridden
        // node renderer
        treeRenderer={nodeWithEyeCheckboxTreeRenderer}
      />
    </div>
  </>;
};

/** Custom checkbox renderer that renders checkbox as an eye */
const eyeCheckboxRenderer = (props: NodeCheckboxRenderProps) => (
  <ImageCheckBox
    checked={props.checked}
    disabled={props.disabled}
    imageOn="icon-visibility"
    imageOff="icon-visibility-hide-2"
    onClick={props.onChange}
    tooltip={props.title}
  />
);

/** Custom node renderer. It uses default 'TreeNodeRenderer' but overrides default checkbox renderer to render checkbox as an eye */
const nodeWithEyeCheckboxRenderer = (props: TreeNodeRendererProps) => (
  <TreeNodeRenderer
    {...props}
    checkboxRenderer={eyeCheckboxRenderer}
  />
);

/** Custom tree renderer. It uses default `TreeRenderer` but overrides default node renderer to render node with custom checkbox */
const nodeWithEyeCheckboxTreeRenderer = (props: TreeRendererProps) => (
  <TreeRenderer
    {...props}
    nodeRenderer={nodeWithEyeCheckboxRenderer}
  />
);

/**
 * Data provider which uses SampleDataProvider to get nodes but additionally
 * updates nodes to have visible checkbox.
 */
class NodesWithCheckboxProvider extends SampleDataProvider {
  public async getNodes(parent?: TreeNodeItem) {
    // get nodes from SampleDataProvider
    const nodes = await super.getNodes(parent);

    // for each node set 'isCheckboxVisible' flag to true
    nodes.forEach((node) => {
      node.isCheckboxVisible = true;
    });
    return nodes;
  }
}
