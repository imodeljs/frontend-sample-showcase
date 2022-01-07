/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useEffect, useState } from "react";
import { IModelConnection } from "@itwin/core-frontend";
import { ControlledTree, SelectionMode, useTreeEventsHandler, useTreeModel } from "@itwin/components-react";
import { usePresentationTreeNodeLoader } from "@itwin/presentation-components";
import RULESET_TREE_HIERARCHY from "./TreeHierarchy";
const PAGING_SIZE = 20;

export interface PresentationTreeProps {
  imodel: IModelConnection;
}

/**
 * This component demonstrates how to use `ControlledTree` with presentation rules.
 * It uses presentation rules defined in '../TreeHierarchy.json' to load
 * data from supplied iModel.
 */
export const PresentationTree: FunctionComponent<PresentationTreeProps> = (props) => {
  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(1000);

  // create tree node loader to load data using presentation rules. It loads nodes to tree model
  // in pages using supplied iModel and presentation ruleset.
  // 'usePresentationTreeNodeLoader' creates tree model source and paged tree node loader.
  // Tree model source can be accessed through node loader. New model source and node loader
  // is created when any property of object passed to `usePresentationTreeNodeLoader` changes
  const { nodeLoader } = usePresentationTreeNodeLoader({
    imodel: props.imodel,
    ruleset: RULESET_TREE_HIERARCHY,
    pagingSize: PAGING_SIZE,
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
        selectionMode={SelectionMode.None}
        eventsHandler={eventHandler}
        model={model}
        width={width}
        height={height}
      />
    </div>
  </>;
};
