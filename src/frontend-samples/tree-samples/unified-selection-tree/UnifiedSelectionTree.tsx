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
import SampleApp from "common/SampleApp";

const PAGING_SIZE = 20;
const RULESET_TREE_HIERARCHY: Ruleset = require("../TreeHierarchy.json"); // tslint:disable-line: no-var-requires

export interface CustomNodeLoadingTreeProps {
  imodel: IModelConnection;
}

export default class UnifiedSelectionTreeSample extends React.Component<{ iModelName: string, iModelSelector: React.ReactNode }, { iModel: IModelConnection }> implements SampleApp {

  public getControlPane() {
    return (
      <>
        <div className="sample-ui  component-ui">
          <div className="sample-instructions">
            <span>This tree synchronizes node selections with the viewport. Selecting nodes will cause their corresponding visuals to be highlighted.</span>
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
    return (
      <>
        {this.getControlPane()}
        <div className="dual-view-vertical">
          <div className="sample-tree">
            {(this.state && this.state.iModel) ? <UnifiedSelectionTree imodel={this.state.iModel}></UnifiedSelectionTree> : <></>}
          </div>
          <ReloadableViewport iModelName={this.props.iModelName} onIModelReady={this.onIModelReady}></ReloadableViewport>
        </div>
      </>
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
export function UnifiedSelectionTree(props: UnifiedSelectionTreeProps) {
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
