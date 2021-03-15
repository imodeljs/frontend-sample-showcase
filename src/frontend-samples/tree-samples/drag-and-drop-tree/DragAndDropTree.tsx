/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import mergeRefs from "react-merge-refs";
import {
  ControlledTree, ITreeDataProvider, MutableTreeModel, SelectionMode, TreeModel, TreeModelNode, TreeModelSource, TreeNodeLoader,
  TreeNodeRendererProps, TreeRenderer, useTreeEventsHandler, useTreeModelSource,
  useTreeNodeLoader, useVisibleTreeNodes,
} from "@bentley/ui-components";
import { SimpleTreeNode } from "./SimpleTreeNode";

export interface DragAndDropTreeProps {
  dataProvider: ITreeDataProvider;
}

export const DragAndDropTree: React.FC<DragAndDropTreeProps> = (props) => {
  const modelSource = useTreeModelSource(props.dataProvider);
  const nodeLoader = useTreeNodeLoader(props.dataProvider, modelSource);
  const eventHandlerParams = React.useMemo(() => ({ nodeLoader, modelSource }), [nodeLoader, modelSource]);
  const eventHandler = useTreeEventsHandler(eventHandlerParams);
  const visibleNodes = useVisibleTreeNodes(modelSource);

  const [isDragging, setIsDragging] = React.useState(false);
  const dragDropContextValue = React.useMemo(
    () => ({ treeModelSource: modelSource, treeNodeLoader: nodeLoader, isDragging, setDragging: setIsDragging }),
    [modelSource, nodeLoader, isDragging],
  );

  return <>
    <dragDropContext.Provider value={dragDropContextValue}>
      <ControlledTree
        nodeLoader={nodeLoader}
        selectionMode={SelectionMode.None}
        treeEvents={eventHandler}
        visibleNodes={visibleNodes}
        treeRenderer={(treeProps) => (
          <TreeRenderer {...treeProps} nodeRenderer={(nodeProps) => <DragAndDropNode {...nodeProps} />} />
        )}
      />
    </dragDropContext.Provider>
  </>;
};

interface DragDropContext {
  treeModelSource: TreeModelSource;
  treeNodeLoader: TreeNodeLoader<ITreeDataProvider>;
  isDragging: boolean;
  setDragging: (newValue: boolean) => void;
}

const dragDropContext = React.createContext<DragDropContext | undefined>(undefined);

enum DropArea {
  Above,
  Inside,
  Below,
}

const DragAndDropNode: React.FC<TreeNodeRendererProps> = (props) => {
  const { treeModelSource, treeNodeLoader, isDragging, setDragging } = React.useContext(dragDropContext)!;
  const [, dragSourceRef] = useDrag({
    item: { type: "tree-node", id: props.node.id },
    begin: () => setDragging(true),
    end: () => setDragging(false),
  });

  const [canDrop, setCanDrop] = React.useState(false);
  function handleCanDrop(item: NodeDragObject): boolean {
    const isDroppingOnSelf = props.node.id === item.id && dropArea === DropArea.Inside;
    const newCanDrop = !isDroppingOnSelf && !areNodesRelated(treeModelSource.getModel(), item.id, props.node.id);
    setCanDrop(newCanDrop);
    return newCanDrop;
  }

  const elementRef = React.useRef<HTMLDivElement>(null);
  const [dropArea, setDropArea] = React.useState<DropArea>(DropArea.Inside);
  function handleHover(item: NodeDragObject, monitor: DropTargetMonitor): void {
    const cursorY = monitor.getClientOffset()?.y;
    const dropTargetY = elementRef.current?.getBoundingClientRect().y;
    if (cursorY !== undefined && dropTargetY !== undefined) {
      setDropArea(determineDropArea(25, 7, cursorY - dropTargetY));
      handleCanDrop(item);
    }
  }

  function handleDrop(item: NodeDragObject): void {
    const { parentId, index } = getDropLocation(treeModelSource.getModel(), props.node, dropArea);
    moveNode(treeModelSource, treeNodeLoader, item.id, parentId, index);
  }

  const [{ isHovered }, dropTargetRef] = useDrop({
    accept: "tree-node",
    hover: handleHover,
    canDrop: handleCanDrop,
    drop: handleDrop,
    collect: (monitor) => ({ isHovered: monitor.isOver() }),
  });

  const isDropAreaDisplayed = isHovered && canDrop;
  const nodeStyle: React.CSSProperties = {
    height: 25,
    ...(isDropAreaDisplayed && dropArea === DropArea.Inside && { background: "var(--buic-row-hover)" }),
  };
  return (
    <div ref={mergeRefs([dragSourceRef, dropTargetRef, elementRef])}>
      <div style={{ height: 0 }}>
        {isDropAreaDisplayed && dropArea === DropArea.Above && <NodeInsertMarker topOffset={0} />}
        {isDropAreaDisplayed && dropArea === DropArea.Below && <NodeInsertMarker topOffset={25} />}
      </div>
      <SimpleTreeNode style={nodeStyle} isHoverDisabled={isDragging} {...props} />
    </div>
  );
};

function determineDropArea(areaHeight: number, edgeTargetHeight: number, dropOffset: number): DropArea {
  if (dropOffset < edgeTargetHeight) {
    return DropArea.Above;
  }

  if (dropOffset > (areaHeight - edgeTargetHeight)) {
    return DropArea.Below;
  }

  return DropArea.Inside;
}

interface NodeDragObject {
  type: "tree-node";
  id: string;
}

interface DropLocation {
  parentId: string | undefined;
  index: number;
}

function getDropLocation(treeModel: TreeModel, hoveredNode: TreeModelNode, dropArea: DropArea): DropLocation {
  switch (dropArea) {
    case DropArea.Above:
      return {
        parentId: hoveredNode.parentId,
        index: (treeModel as MutableTreeModel).getChildOffset(hoveredNode.parentId, hoveredNode.id)!,
      };

    case DropArea.Inside:
      return { parentId: hoveredNode.id, index: 0 };

    case DropArea.Below:
      if (hoveredNode.isExpanded) {
        return {
          parentId: hoveredNode.id,
          index: 0,
        };
      }

      return {
        parentId: hoveredNode.parentId,
        index: (treeModel as MutableTreeModel).getChildOffset(hoveredNode.parentId, hoveredNode.id)! + 1,
      };
  }
}

interface NodeInsertMarkerProps {
  topOffset: number;
}

const NodeInsertMarker: React.FC<NodeInsertMarkerProps> = (props) => {
  return <div style={{ height: 2, background: "rgb(var(--buic-background-3-rgb))", position: "relative", top: props.topOffset }} />;
};

function areNodesRelated(model: TreeModel, ancestorNodeId: string, descendantNodeId: string): boolean {
  const node = model.getNode(descendantNodeId);
  if (node === undefined || node.parentId === undefined) {
    return false;
  }

  return node.parentId === ancestorNodeId ? true : areNodesRelated(model, ancestorNodeId, node.parentId);
}

function moveNode(
  modelSource: TreeModelSource,
  nodeLoader: TreeNodeLoader<ITreeDataProvider>,
  sourceNodeId: string,
  targetParentId: string | undefined,
  targetIndex: number,
): void {
  if (targetParentId === undefined) {
    updateModel();
    return;
  }

  const parentNode = modelSource.getModel().getNode(targetParentId)!;
  if (parentNode.numChildren === undefined) {
    nodeLoader.loadNode(parentNode, 0).subscribe(() => updateModel());
  } else {
    updateModel();
  }

  function updateModel() {
    modelSource.modifyModel((model) => {
      const nodeInput = model.getNode(sourceNodeId)!;
      const inputNodeOffset = model.getChildOffset(nodeInput.parentId, sourceNodeId)!;
      const children = model.getChildren(nodeInput.parentId)!;
      children.remove(inputNodeOffset);
      if (nodeInput.parentId === undefined) {
        (model.getRootNode().numChildren as number) -= 1;
      } else {
        (model.getNode(nodeInput.parentId)!.numChildren as number) -= 1;
      }

      if (nodeInput.parentId === targetParentId && targetIndex > inputNodeOffset) {
        targetIndex -= 1;
      }

      model.insertChild(targetParentId, nodeInput, targetIndex);

      if (targetParentId === undefined) {
        updateDepths(sourceNodeId, -1);
      } else {
        const updatedParentNode = model.getNode(targetParentId)!;
        updateDepths(sourceNodeId, updatedParentNode.depth);
        updatedParentNode.isExpanded = true;
      }

      function updateDepths(parentMovedNodeId: string, parentDepth: number) {
        const movedNode = model.getNode(parentMovedNodeId)!;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
        (movedNode.depth as number) = parentDepth + 1;
        for (const [nodeId] of model.getChildren(parentMovedNodeId)?.iterateValues() ?? []) {
          updateDepths(nodeId, movedNode.depth);
        }
      }
    });
  }
}
