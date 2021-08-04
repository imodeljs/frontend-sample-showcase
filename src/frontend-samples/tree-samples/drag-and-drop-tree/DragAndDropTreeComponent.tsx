/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { DragObjectWithType, DropTargetMonitor, useDrag, useDrop } from "react-dnd";
import {
  ControlledTree, ITreeDataProvider, SelectionMode, TreeModel, TreeModelNode, TreeModelSource,
  TreeNodeLoader, TreeNodeRendererProps, TreeRenderer, useTreeEventsHandler, useTreeModelSource,
  useTreeNodeLoader, useVisibleTreeNodes,
} from "@bentley/ui-components";
import { BasicTreeNode } from "./BasicTreeNode";
import * as mergeRefsExports from "react-merge-refs";
import { SampleDataProvider } from "@itwinjs-sandbox";
import { DragAndDropTreeApi } from "./DragAndDropTreeApi";
const mergeRefs = mergeRefsExports.default;

/** Our custom tree component */
export const DragAndDropTreeComponent: React.FC = () => {
  // Standard tree rendering procedure. Check out Basic Tree sample for more details.
  const [treeDataProvider, setTreeDataProvider] = React.useState(new SampleDataProvider());
  const modelSource = useTreeModelSource(treeDataProvider);
  const nodeLoader = useTreeNodeLoader(treeDataProvider, modelSource);
  const eventHandlerParams = React.useMemo(() => ({ nodeLoader, modelSource }), [nodeLoader, modelSource]);
  const eventHandler = useTreeEventsHandler(eventHandlerParams);
  const visibleNodes = useVisibleTreeNodes(modelSource);

  React.useEffect(() => {
    const subscriber = DragAndDropTreeApi.on(() => setTreeDataProvider(new SampleDataProvider()));
    return subscriber;
  }, []);

  // Due to a long-standing bug across multiple browsers, element hover state is not being updated while drag is in
  // action. As a workaround, when any node is being dragged, we remove hover style class from all nodes and start
  // highlighting nodes manually.
  const [isDragging, setIsDragging] = React.useState(false);

  // Values that will be accessible to each custom node
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

/** Information regarding the item being dragged */
interface NodeDragObject extends DragObjectWithType {
  /** Marks the type of dragged item, required by react-dnd */
  type: "tree-node";

  /** Links dragged item to a tree node id */
  id: string;
}

const DragAndDropNode: React.FC<TreeNodeRendererProps> = (props) => {
  const { treeModelSource, treeNodeLoader, isDragging, setDragging } = React.useContext(dragDropContext)!;

  // Make node draggable
  const [, dragSourceRef] = useDrag({
    item: { type: "tree-node", id: props.node.id },
    begin: () => setDragging(true),
    end: () => setDragging(false),
  });

  // Make node accept drop events
  const [{ isHovered }, dropTargetRef] = useDrop({
    accept: "tree-node",
    hover: handleHover,
    canDrop: handleCanDrop,
    drop: handleDrop,
    collect: (monitor) => ({ isHovered: monitor.isOver() }),
  });

  const [canDrop, setCanDrop] = React.useState(false);
  function handleCanDrop(item: NodeDragObject): boolean {
    // Do not allow dropping a node in such a way that would create a parent-child relationship cycle
    const isDroppingOnSelf = props.node.id === item.id && dropArea === DropArea.Inside;
    const newCanDrop = !isDroppingOnSelf && !areNodesRelated(treeModelSource.getModel(), item.id, props.node.id);
    setCanDrop(newCanDrop);
    return newCanDrop;
  }

  const elementRef = React.useRef<HTMLDivElement>(null);
  const [dropArea, setDropArea] = React.useState<DropArea>(DropArea.Inside);
  function handleHover(item: NodeDragObject, monitor: DropTargetMonitor): void {
    // Determine which drop area is hovered and whether we can drop the node there
    const cursorY = monitor.getClientOffset()?.y;
    const dropTargetY = elementRef.current?.getBoundingClientRect().y;
    if (cursorY !== undefined && dropTargetY !== undefined) {
      setDropArea(determineDropArea(25, 7, cursorY - dropTargetY));
      handleCanDrop(item);
    }
  }

  function handleDrop(item: NodeDragObject): void {
    // The main entry point for drop event handling
    const { parentId, index } = getDropLocation(treeModelSource.getModel(), props.node, dropArea);
    moveNode(treeModelSource, treeNodeLoader, item.id, parentId, index)
      .catch((error) => {
        // eslint-disable-next-line no-console
        console.error(error);
      });
  }

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
      <BasicTreeNode style={nodeStyle} isHoverDisabled={isDragging} {...props} />
    </div>
  );
};

interface NodeInsertMarkerProps {
  /** Shifts marker downwards by the specified amount */
  topOffset: number;
}

/** Thin horizontal line that marks drop location in between nodes */
const NodeInsertMarker: React.FC<NodeInsertMarkerProps> = (props) => {
  const style: React.CSSProperties = {
    height: 2,
    background: "rgb(var(--buic-background-5-rgb))",
    position: "relative",
    top: props.topOffset,
  };
  return <div style={style} />;
};

/** Visual drop location */
enum DropArea {
  Above,
  Inside,
  Below,
}

/**
 * Determines which part of the node area is being hovered
 * @param areaHeight Height of the whole droppable area
 * @param edgeTargetHeight Thickness of top and bottom areas
 * @param dropOffset y location at which the drop has occured, relative to the whole droppable area
 * @returns An appropriate DropArea based on target dimensions and drop offset
 */
function determineDropArea(areaHeight: number, edgeTargetHeight: number, dropOffset: number): DropArea {
  if (dropOffset < edgeTargetHeight) {
    return DropArea.Above;
  }

  if (dropOffset > (areaHeight - edgeTargetHeight)) {
    return DropArea.Below;
  }

  return DropArea.Inside;
}

/** Drop location in terms of tree model nodes */
interface DropLocation {
  /** Target node that will receive a new child */
  parentId: string | undefined;
  /** Child insertion position */
  index: number;
}

/**
 * Determines the target location of dropped node
 * @param treeModel Relevant tree model
 * @param hoveredNode Node that received the drop event
 * @param dropArea Drop location relative to the `hoveredNode`
 * @returns Drop target location
 */
function getDropLocation(treeModel: TreeModel, hoveredNode: TreeModelNode, dropArea: DropArea): DropLocation {
  switch (dropArea) {
    case DropArea.Above:
      return {
        parentId: hoveredNode.parentId,
        index: treeModel.getChildOffset(hoveredNode.parentId, hoveredNode.id)!,
      };

    case DropArea.Inside:
      return { parentId: hoveredNode.id, index: 0 };

    case DropArea.Below:
      if (hoveredNode.isExpanded) {
        return { parentId: hoveredNode.id, index: 0 };
      }

      return {
        parentId: hoveredNode.parentId,
        index: treeModel.getChildOffset(hoveredNode.parentId, hoveredNode.id)! + 1,
      };
  }
}

/** Determines whether ancestor node has descendant node in its subtree */
function areNodesRelated(model: TreeModel, ancestorNodeId: string, descendantNodeId: string): boolean {
  const node = model.getNode(descendantNodeId);
  if (node === undefined || node.parentId === undefined) {
    return false;
  }

  return node.parentId === ancestorNodeId ? true : areNodesRelated(model, ancestorNodeId, node.parentId);
}

/** Moves tree model node to a new location */
async function moveNode(
  modelSource: TreeModelSource,
  nodeLoader: TreeNodeLoader<ITreeDataProvider>,
  sourceNodeId: string,
  targetParentId: string | undefined,
  targetIndex: number,
): Promise<void> {
  // Need to make sure that destination is aware of its child count, otherwise `model.moveNode` will fail
  await loadChildren(nodeLoader, targetParentId);
  modelSource.modifyModel((model) => {
    model.moveNode(sourceNodeId, targetParentId, targetIndex);
    if (targetParentId !== undefined) {
      model.getNode(targetParentId)!.isExpanded = true;
    }
  });
}

/** Makes sure that parent has its children loaded */
async function loadChildren(
  nodeLoader: TreeNodeLoader<ITreeDataProvider>,
  parentId: string | undefined,
): Promise<void> {
  if (parentId === undefined) {
    return;
  }

  const parentNode = nodeLoader.modelSource.getModel().getNode(parentId)!;
  if (parentNode.numChildren !== undefined) {
    return;
  }

  return new Promise((resolve) => { nodeLoader.loadNode(parentNode, 0).subscribe(() => resolve()); });
}
