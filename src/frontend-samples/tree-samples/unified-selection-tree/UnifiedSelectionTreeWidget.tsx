/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent } from "react";
import { ControlledTree, SelectionMode, useVisibleTreeNodes } from "@bentley/ui-components";
import { usePresentationTreeNodeLoader, useUnifiedSelectionTreeEventHandler } from "@bentley/presentation-components";
import { StagePanelLocation, StagePanelSection, useActiveIModelConnection } from "@bentley/ui-framework";
import { AbstractWidgetProps, UiItemsProvider, WidgetState } from "@bentley/ui-abstract";
import { Ruleset } from "@bentley/presentation-common";
import RULESET_TREE_HIERARCHY from "./TreeHierarchy";
import "./UnifiedSelectionTree.scss";
const PAGING_SIZE = 20;

/**
 * This component demonstrates how to hook `ControlledTree` into Unified Selection with default Unified Selection handling.
 * It uses presentation rules defined in '../TreeHierarchy.json' to load data from supplied iModel.
 *
 * In order for tree to modify Unified Selection and react to it's changes `UnifiedSelectionTreeEventHandler`
 * is used. It extends default `TreeEventHandler` and additionally adds/removes keys to/from Unified Selection
 * when nodes are selected/deselected and changes tree selection to match Unified Selection.
 */
const UnifiedSelectionWidget: FunctionComponent = () => {
  const iModelConnection = useActiveIModelConnection();

  // create tree node loader to load nodes using presentation rules. It loads nodes to tree model
  // in pages using supplied iModel and presentation ruleset.
  // 'usePresentationTreeNodeLoader' creates tree model source and paged tree node loader.
  // Tree model source can be accessed through node loader. New model source and node loader
  // is created when any property of object passed to `usePresentationTreeNodeLoader` changes
  const nodeLoader = usePresentationTreeNodeLoader({
    imodel: iModelConnection!,
    ruleset: RULESET_TREE_HIERARCHY as Ruleset,
    pagingSize: PAGING_SIZE,
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

  return (
    <div className="sample-options unified-selection-tree">
      <ControlledTree
        nodeLoader={nodeLoader}
        selectionMode={SelectionMode.Extended}
        treeEvents={eventHandler}
        visibleNodes={visibleNodes}
      />
    </div>
  );
};

export class UnifiedSelectionWidgetProvider implements UiItemsProvider {
  public readonly id: string = "UnifiedSelectionWidgetProvider";

  public provideWidgets(_stageId: string, _stageUsage: string, location: StagePanelLocation, _section?: StagePanelSection): ReadonlyArray<AbstractWidgetProps> {
    const widgets: AbstractWidgetProps[] = [];
    if (location === StagePanelLocation.Right) {
      widgets.push(
        {
          id: "UnifiedSelectionWidget",
          label: "Unified Selection Tree",
          defaultState: WidgetState.Floating,
          // eslint-disable-next-line react/display-name
          getWidgetContent: () => <UnifiedSelectionWidget />,
        }
      );
    }
    return widgets;
  }
}
