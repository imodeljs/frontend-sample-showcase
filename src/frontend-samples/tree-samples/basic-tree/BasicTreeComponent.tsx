/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import React, { FunctionComponent, useEffect, useState } from "react";
import { ControlledTree, SelectionMode, useTreeEventsHandler, useTreeModel, useTreeModelSource, useTreeNodeLoader } from "@itwin/components-react";
import { SampleDataProvider } from "@itwin/sandbox";

export const BasicTreeComponent: FunctionComponent = () => {
  const [width, setWidth] = useState<number>(1000);
  const [height, setHeight] = useState<number>(1000);
  // create data provider to get some nodes to show in tree
  // `React.useMemo' is used avoid creating new object on each render
  const dataProvider = React.useMemo(() => new SampleDataProvider(), []);

  // create model source for tree. Model source contains tree model and provides an API to modify
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
  const eventHandlerParams = React.useMemo(() => ({ nodeLoader, modelSource, collapsedChildrenDisposalEnabled: true }), [nodeLoader, modelSource]);

  // create default event handler. It handles tree events: expanding/collapsing, selecting/deselecting nodes,
  // checking/unchecking checkboxes. It also initiates child nodes loading when parent node is expanded.
  // `useTreeEventsHandler` created new event handler when 'eventHandlerParams' object changes
  const eventHandler = useTreeEventsHandler(eventHandlerParams);

  // get list of visible nodes to render in `ControlledTree`. This is a flat list of nodes in tree model.
  // `useVisibleTreeNodes` uses 'modelSource' to get flat list of nodes and listens for model changes to
  // re-render component with updated nodes list

  const model = useTreeModel(modelSource);

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
