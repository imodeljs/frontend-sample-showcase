/*---------------------------------------------------------------------------------------------
* Copyright (c) Bentley Systems, Incorporated. All rights reserved.
* See LICENSE.md in the project root for license terms and full copyright notice.
*--------------------------------------------------------------------------------------------*/
import * as React from "react";
import { ExpandableBlock, ExpandableBlockProps } from "@itwin/core-react";

/** Sample component using ExpandableBlock with an expanded state  */
// eslint-disable-next-line @typescript-eslint/naming-convention
export const SampleExpandableBlock: React.FC<ExpandableBlockProps> = (props: ExpandableBlockProps) => {
  const [expanded, setExpanded] = React.useState(true);

  // Inverts the expandable block's current state
  const handleClick = (event: React.MouseEvent<HTMLDivElement, MouseEvent>): void => {
    setExpanded(!expanded);

    props.onClick && props.onClick(event);
  };

  return (
    <ExpandableBlock {...props} isExpanded={expanded} onClick={handleClick} />
  );
};
