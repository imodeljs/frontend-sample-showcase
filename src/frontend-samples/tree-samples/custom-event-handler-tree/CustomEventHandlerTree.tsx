/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import "common/DataProvider/Trees.scss";

import {
  AbstractTreeNodeLoaderWithProvider, ControlledTree, SelectionMode, TreeCheckboxStateChangeEventArgs, TreeDataProvider,
  TreeEventHandler, TreeNodeItem, TreeSelectionModificationEventArgs, TreeSelectionReplacementEventArgs,
  useTreeModelSource, useTreeNodeLoader, useVisibleTreeNodes,
} from "@bentley/ui-components";

import { CheckBoxState, useDisposable } from "@bentley/ui-core";

import { SampleDataProvider } from "common/DataProvider/SampleDataProvider";

export default class CustomEventHandlerTreeSample extends React.Component<{}> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Selection in this tree is synchronized with checkboxes. Notice how selecting node checks checkbox and vice versa.</span>
          </div>
        </div>
      </>
    );
  }

  public static async setup() {
    return <CustomEventHandlerTreeSample></CustomEventHandlerTreeSample>;
  }

  public render() {
    return (
      <>
        {this.getControlPane()}
        <div className="tree sample-tree">
          <CustomEventHandlerTree></CustomEventHandlerTree>
        </div>
      </>
    );
  }

}

/**
 * This component demonstrates how to use `ControlledTree` with custom tree events handling.
 * It uses `NodesWithCheckboxProvider` class to get some fake data to show.
 *
 * In order to change how tree behaves when tree node is selected/deselected,
 * expanded/collapsed or node's checkbox state changes, custom tree event handler should be
 * passed to `ControlledTree`. In this component `SynchronizedCheckboxSelectionHandler` is used
 * to handle tree events. It extends default `TreeEventHandler` by adding checkbox states
 * synchronization with selection.
 */
export function CustomEventHandlerTree() {
  // create data provider to get some nodes to show in tree
  // `React.useMemo' is used avoid creating new object on each render
  const dataProvider = React.useMemo(() => new NodesWithCheckboxProvider(), []);

  // create model source for tree model. Model source contains tree model and provides an API to modify
  // model and listen for changes in tree model.
  // `useTreeModelSource` creates new model source when 'dataProvider' object changes
  const modelSource = useTreeModelSource(dataProvider);

  // create tree node loader to load nodes to tree model. It uses 'dataProvider' to get
  // nodes and adds them to tree model using 'modelSource'
  const nodeLoader = useTreeNodeLoader(dataProvider, modelSource);

  // create custom event handler. It handles all tree event same as `TreeEventHandler` but additionally
  // it selects/deselects node when checkbox is checked/unchecked and vice versa.
  // `useDisposable` takes care of disposing old event handler when new is created in case 'nodeLoader' has changed
  // `React.useCallback` is used to avoid creating new callback that creates handler on each render
  const eventHandler = useDisposable(React.useCallback(() => new SynchronizedCheckboxSelectionHandler(nodeLoader), [nodeLoader]));

  // get list of visible nodes to render in `ControlledTree`. This is a flat list of nodes in tree model.
  // `useVisibleTreeNodes` uses 'modelSource' to get flat list of nodes and listens for model changes to
  // re-render component with updated nodes list
  const visibleNodes = useVisibleTreeNodes(nodeLoader.modelSource);

  return <>
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

/** Custom even handler that synchronizes selection and checkboxes */
class SynchronizedCheckboxSelectionHandler extends TreeEventHandler {
  constructor(nodeLoader: AbstractTreeNodeLoaderWithProvider<TreeDataProvider>) {
    super({ modelSource: nodeLoader.modelSource, nodeLoader, collapsedChildrenDisposalEnabled: true });
  }

  /** Selects or deselects nodes until event is handled, handler is disposed selection replaced event occurs.  */
  public onSelectionModified(event: TreeSelectionModificationEventArgs) {
    // call base selection handling
    const baseSubscription = super.onSelectionModified(event);

    // subscribe to selection modifications to get selected and deselected items and do some additional
    // work with them
    const subscription = event.modifications.subscribe({
      next: ({ selectedNodeItems, deselectedNodeItems }) => {
        // here goes code that should be invoked when selection in tree is modified. It could
        // be some additional modifications to tree model or some code that depends on tree selection

        // in case some selected/deselected nodes are not loaded yet this callback will be invoked several times
        // with new 'selectedNodeItems' and 'deselectedNodeItems' when they are loaded

        // modify nodes in tree model by checking/unchecking selected/deselected nodes' checkboxes
        this.modelSource.modifyModel((model) => {
          selectedNodeItems.forEach((item) => {
            const node = model.getNode(item.id)!;
            node.checkbox.state = CheckBoxState.On;
          });
          deselectedNodeItems.forEach((item) => {
            const node = model.getNode(item.id)!;
            node.checkbox.state = CheckBoxState.Off;
          });
        });
      },
    });

    // stop checkboxes handling when base selection handling is stopped
    baseSubscription?.add(subscription);
    return baseSubscription;
  }

  /** Replaces currently selected nodes until event is handled, handler is disposed or another selection replaced event occurs. */
  public onSelectionReplaced(event: TreeSelectionReplacementEventArgs) {
    // call base selection handling
    const baseSubscription = super.onSelectionReplaced(event);

    let firstEmission = true;
    // subscribe to selection replacements to get selected node items and do some additional work
    // with them
    const subscription = event.replacements.subscribe({
      next: ({ selectedNodeItems }) => {
        // here goes code that should be invoked when selection in tree is replaced. It could be some additional
        // modifications to tree model or some code that depends on tree selection

        // in case some selected nodes are not loaded yet, this callback will be invoked several times
        // with new 'selectedNodeItems' when they are loaded

        // modify nodes in tree model by checking selected nodes' checkboxes
        this.modelSource.modifyModel((model) => {
          // on first emission turn off all checkboxes
          if (firstEmission) {
            for (const node of model.iterateTreeModelNodes())
              node.checkbox.state = CheckBoxState.Off;
            firstEmission = false;
          }
          selectedNodeItems.forEach((item) => {
            const node = model.getNode(item.id)!;
            node.checkbox.state = CheckBoxState.On;
          });
        });
      },
    });
    // stop checkboxes handling when base selection handling is stopped
    baseSubscription?.add(subscription);
    return baseSubscription;
  }

  /** Changes nodes checkboxes states until event is handled or handler is disposed */
  public onCheckboxStateChanged({ stateChanges }: TreeCheckboxStateChangeEventArgs) {
    // call base checkbox handling
    const baseHandling = super.onCheckboxStateChanged({ stateChanges });

    // subscribe to checkbox state changes to new checkbox states and do some additional work with them
    const selectionHandling = stateChanges.subscribe({
      next: (changes) => {
        // there goes code that should invoked when node's checkbox is checked/unchecked. It could be some
        // additional modifications to tree model or some code that depends on tree checkboxes' states

        // modify nodes to be selected/deselected if checkbox was checked or unchecked
        this.modelSource.modifyModel((model) => {
          changes.forEach((change) => {
            const node = model.getNode(change.nodeItem.id)!;
            node.isSelected = (change.newState === CheckBoxState.On);
          });
        });
      },
    });
    // stop handling selection when checkboxes handling is stopped
    baseHandling?.add(selectionHandling);
    return baseHandling;
  }
}

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
