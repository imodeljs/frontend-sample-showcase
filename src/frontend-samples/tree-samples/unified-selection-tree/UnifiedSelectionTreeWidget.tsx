/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useEffect, useState } from "react";
import { ControlledTree, SelectionMode, useTreeModel } from "@itwin/components-react";
import { usePresentationTreeNodeLoader, useUnifiedSelectionTreeEventHandler } from "@itwin/presentation-components";
import { useActiveIModelConnection } from "@itwin/appui-react";
import { AbstractWidgetProps, StagePanelLocation, StagePanelSection, UiItemsProvider, WidgetState } from "@itwin/appui-abstract";
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
  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(1000);
  const iModelConnection = useActiveIModelConnection();

  // create tree node loader to load nodes using presentation rules. It loads nodes to tree model
  // in pages using supplied iModel and presentation ruleset.
  // 'usePresentationTreeNodeLoader' creates tree model source and paged tree node loader.
  // Tree model source can be accessed through node loader. New model source and node loader
  // is created when any property of object passed to `usePresentationTreeNodeLoader` changes
  const { nodeLoader } = usePresentationTreeNodeLoader({
    imodel: iModelConnection!,
    ruleset: RULESET_TREE_HIERARCHY,
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
  const model = useTreeModel(nodeLoader.modelSource);

  useEffect(() => {
    const viewerContainer = document.querySelector(".itwin-viewer-container");
    if (viewerContainer) {
      setWidth(viewerContainer.clientWidth);
      setHeight(viewerContainer.clientHeight);
      const resizeObserver = new ResizeObserver((entries: any) => {
        for (const entry of entries) {
          setWidth(entry.contentRect.width);
          setHeight(entry.contentRect.height);
        }
      });

      resizeObserver.observe(viewerContainer);
      return () => {
        resizeObserver.unobserve(viewerContainer);
      };
    }
    return () => { };
  }, []);

  return <>
    <div className="tree">
      <ControlledTree
        nodeLoader={nodeLoader}
        selectionMode={SelectionMode.Extended}
        eventsHandler={eventHandler}
        model={model}
        width={width}
        height={height}
      />
    </div>
  </>;
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
        },
      );
    }
    return widgets;
  }
}
