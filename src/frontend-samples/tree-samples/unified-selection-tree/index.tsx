/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { IModelConnection } from "@bentley/imodeljs-frontend";
import { ControlledTree, SelectionMode, useVisibleTreeNodes } from "@bentley/ui-components";
import { usePresentationTreeNodeLoader, useUnifiedSelectionTreeEventHandler } from "@bentley/presentation-components";
import { Ruleset } from "@bentley/presentation-common";
import { ReloadableViewport } from "../../../Components/Viewport/ReloadableViewport";
import { ReloadableConnection } from "../../../Components/ReloadableConnection/ReloadableConnection";

const PAGING_SIZE = 20;
const RULESET_TREE_HIERARCHY: Ruleset = require("../TreeHierarchy.json"); // tslint:disable-line: no-var-requires

export class UnifiedSelectionTreeSample extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, { iModel: IModelConnection }> {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>Selection in the tree is synchronized with selection in the viewport. Select some nodes in the tree and notice how they highlight in the viewport.</span>
          </div>
          {this.props.iModelSelector}
        </div>
      </>
    );
  }

  public static async setup(iModelName: string, iModelSelector: React.ReactNode) {
    return <UnifiedSelectionTreeSample iModelName={iModelName} iModelSelector={iModelSelector}></UnifiedSelectionTreeSample>;
  }

  public onIModelReady = (imodel: IModelConnection) => {
    this.setState({
      iModel: imodel,
    });
  }

  public render() {
    //            {(this.state && this.state.iModel) ? <UnifiedSelectionTree imodel={this.state.iModel}></UnifiedSelectionTree> : <></>}
    //<ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></ReloadableViewport>
    //const tree = <UnifiedSelectionTree imodel={this.state.iModel}></UnifiedSelectionTree>
    return (
      <>
        <div className="dual-view-vertical">
          <ReloadableConnection iModelName={this.props.iModelName} userInterface={UnifiedSelectionTree} ></ReloadableConnection>
        </div>
        {this.getControlPane()}
      </>
    );
  }
}

export class UnifiedSelectionTree extends React.Component<{ imodel: IModelConnection }, {}>  {
  public render() {
    return (
      <UnifiedSelectionTreeFunction imodel={this.props.imodel}></UnifiedSelectionTreeFunction>
    );
  }
}

export interface UnifiedSelectionTreeProps {
  imodel: IModelConnection;
}

/**
 * This component demonstrates how to hook `ControlledTree` into Unified Selection with default Unified Selection handling.
 * It uses presentation rules defined in '../TreeHierarchy.json' to load data from supplied iModel.
 *
 * In order for tree to modify Unified Selection and react to it's changes `UnifiedSelectionTreeEventHandler`
 * is used. It extends default `TreeEventHandler` and additionally adds/removes keys to/from Unified Selection
 * when nodes are selected/deselected and changes tree selection to match Unified Selection.
 */
export function UnifiedSelectionTreeFunction(props: UnifiedSelectionTreeProps) {
  // create tree node loader to load nodes using presentation rules. It loads nodes to tree model
  // in pages using supplied iModel and presentation ruleset.
  // 'usePresentationTreeNodeLoader' creates tree model source and paged tree node loader.
  // Tree model source can be accessed through node loader. New model source and node loader
  // is created when any property of object passed to `usePresentationTreeNodeLoader` changes
  const nodeLoader = usePresentationTreeNodeLoader({
    imodel: props.imodel,
    ruleset: RULESET_TREE_HIERARCHY,
    pageSize: PAGING_SIZE,
  });

  // create event handler that handles tree events: expanding/collapsing, selecting/deselecting nodes. Additionally it adds/removes keys to/from
  // Unified Selection when nodes are selected/deselected and updates nodes' selection in tree model to match Unified Selection.
  // `useUnifiedSelectionTreeEventHandler` creates new event handler when object passed to it changes. It only accepts
  // node loaders that uses `IPresentationTreeDataProvider`
  const eventHandler = useUnifiedSelectionTreeEventHandler({ nodeLoader, collapsedChildrenDisposalEnabled: true });

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
