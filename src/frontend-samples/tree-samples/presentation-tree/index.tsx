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
import { usePresentationTreeNodeLoader } from "@bentley/presentation-components";
import { Ruleset } from "@bentley/presentation-common";
import { ReloadableConnection } from "../../../Components/ReloadableComponent/ReloadableConnection";

const PAGING_SIZE = 20;
const RULESET_TREE_HIERARCHY: Ruleset = require("../TreeHierarchy.json"); // tslint:disable-line: no-var-requires

export interface PresentationTreeProps {
  imodel: IModelConnection;
}

export class PresentationTreeSample extends React.Component<{ iModelName: string }, { iModel: IModelConnection }> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Data in this tree is loaded using Presentation rules.</span>
          </div>
        </div>
      </>
    );
  }

  public static async setup(iModelName: string) {
    return <PresentationTreeSample iModelName={iModelName}></PresentationTreeSample>;
  }

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  }

  public render() {
    return (
      <>
        {this.getControlPane()}
        <ReloadableConnection iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></ReloadableConnection>
        <div className="sample-tree">
          {(this.state && this.state.iModel) ? <PresentationTree imodel={this.state.iModel}></PresentationTree> : <></>}
        </div>
      </>
    );
  }
}

/**
 * This component demonstrates how to use `ControlledTree` with presentation rules.
 * It uses presentation rules defined in '../TreeHierarchy.json' to load
 * data from supplied iModel.
 */
export function PresentationTree(props: PresentationTreeProps) {
  // create tree node loader to load data using presentation rules. It loads nodes to tree model
  // in pages using supplied iModel and presentation ruleset.
  // 'usePresentationTreeNodeLoader' creates tree model source and paged tree node loader.
  // Tree model source can be accessed through node loader. New model source and node loader
  // is created when any property of object passed to `usePresentationTreeNodeLoader` changes
  const nodeLoader = usePresentationTreeNodeLoader({
    imodel: props.imodel,
    ruleset: RULESET_TREE_HIERARCHY,
    pageSize: PAGING_SIZE,
  });

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
