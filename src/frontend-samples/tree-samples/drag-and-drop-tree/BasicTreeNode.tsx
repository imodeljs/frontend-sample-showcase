/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/

import * as React from "react";
import { PropertyValueRendererManager, TreeActions, TreeModelNode } from "@bentley/ui-components";
import { TreeNode } from "@bentley/ui-core";

export interface BasicTreeNodeProps {
  style: React.CSSProperties;
  node: TreeModelNode;
  treeActions: TreeActions;
  isHoverDisabled: boolean;
}

export const BasicTreeNode: React.FC<BasicTreeNodeProps> = (props) => {
  function handleExpansionToggle() {
    if (props.node.isExpanded) {
      props.treeActions.onNodeCollapsed(props.node.id);
    } else {
      props.treeActions.onNodeExpanded(props.node.id);
    }
  }

  return (
    <TreeNode
      style={props.style}
      label={PropertyValueRendererManager.defaultManager.render(props.node.label)}
      level={props.node.depth}
      isExpanded={props.node.isExpanded}
      isHoverDisabled={props.isHoverDisabled}
      isSelected={props.node.isSelected}
      isLoading={props.node.isLoading}
      isLeaf={props.node.numChildren === 0}
      onClickExpansionToggle={handleExpansionToggle} />
  );
};
